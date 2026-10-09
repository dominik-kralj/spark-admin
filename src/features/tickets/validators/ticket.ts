import { z } from 'zod'

import type { ProcessingStatus } from '@/shared/lib/processingStatus'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { utcDateTimeSchema } from '@/shared/lib/utcDateTime'

const rawStatusSchema = z.enum(['PENDING', 'PROCESSING', 'DONE', 'FAIL'])

type RawStatus = z.output<typeof rawStatusSchema>

const statusForRaw: Record<RawStatus, ProcessingStatus> = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    DONE: 'done',
    FAIL: 'failed',
}

const rawForStatus: Record<ProcessingStatus, RawStatus> = {
    pending: 'PENDING',
    processing: 'PROCESSING',
    done: 'DONE',
    failed: 'FAIL',
}

const ticketTypeForRaw = { Standard: 'standard', Dnevna: 'daily' } as const

// The spec names the column PaymentStatus but its constraints and samples say VivaStatus.
function withPaymentStatus(raw: unknown): unknown {
    if (typeof raw !== 'object' || raw === null || 'paymentStatus' in raw) return raw
    if (!('vivaStatus' in raw)) return raw

    return { ...raw, paymentStatus: raw.vivaStatus }
}

const ticketFields = {
    ticketId: z.string(),
    ticketType: z.enum(['Standard', 'Dnevna']).default('Standard'),
    createdAt: utcDateTimeSchema,
    vehicleRegistration: z.string(),
    zoneId: z.number(),
    zoneCode: z.string(),
    parkingMinutes: z.number(),
    amount: z.number(),
    validUntil: utcDateTimeSchema.nullish(),
    paymentStatus: rawStatusSchema,
    fiscalStatus: rawStatusSchema,
}

const ticketDetailFields = {
    ...ticketFields,
    transactionId: z.union([z.number(), z.string()]),
    osnovica: z.number().nullish(),
    stopaPDV: z.number().nullish(),
    iznosPDV: z.number().nullish(),
    jir: z.string().nullish(),
    zki: z.string().nullish(),
    fiscalizedAt: utcDateTimeSchema.nullish(),
    fiscalLastError: z.string().nullish(),
}

export const ticketResponseSchema = z.preprocess(withPaymentStatus, z.object(ticketFields))

export const ticketDetailResponseSchema = z.preprocess(
    withPaymentStatus,
    z.object(ticketDetailFields),
)

export const ticketPageResponseSchema = z.object({
    items: z.array(ticketResponseSchema),
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
})

export const newTicketCountResponseSchema = z.object({ count: z.number() })

type TicketResponse = z.output<typeof ticketResponseSchema>

type TicketDetailResponse = z.output<typeof ticketDetailResponseSchema>

type TicketPageResponse = z.output<typeof ticketPageResponseSchema>

export interface Ticket {
    id: string
    type: 'standard' | 'daily'
    createdAt: Date
    plate: string
    zone: { id: number; code: string }
    parkingMinutes: number
    /** EUR at the API's full precision; rounded only when shown. */
    amount: number
    validUntil: Date
    payment: { status: ProcessingStatus }
    fiscal: { status: ProcessingStatus }
}

export interface TicketDetail extends Ticket {
    transactionId: string
    /** Base, rate in percent and VAT amount, at full precision; not in the contract yet. */
    vat: { base: number | null; rate: number | null; amount: number | null }
    fiscal: {
        status: ProcessingStatus
        jir: string | null
        zki: string | null
        fiscalizedAt: Date | null
        /** The fiscal service's own text, shown as it comes. */
        lastError: string | null
    }
}

export interface TicketPage {
    items: Ticket[]
    page: number
    pageSize: number
    totalCount: number
}

export type TicketSortKey = 'createdAt' | 'plate' | 'amount' | 'validUntil'

export interface TicketFilters {
    plate?: string
    /** Inclusive. */
    createdFrom?: Date
    /** Exclusive. */
    createdTo?: Date
    zoneId?: number
    fiscalStatus?: ProcessingStatus
}

export interface TicketListParams {
    page: number
    pageSize: number
    sort: Sort<TicketSortKey>
    filters: TicketFilters
}

const rawSortKey: Record<TicketSortKey, string> = {
    createdAt: 'createdAt',
    plate: 'vehicleRegistration',
    amount: 'amount',
    validUntil: 'validUntil',
}

const minuteInMs = 60_000

export function toTicket(raw: TicketResponse): Ticket {
    return {
        id: raw.ticketId,
        type: ticketTypeForRaw[raw.ticketType],
        createdAt: raw.createdAt,
        plate: raw.vehicleRegistration,
        zone: { id: raw.zoneId, code: raw.zoneCode },
        parkingMinutes: raw.parkingMinutes,
        amount: raw.amount,
        // A computed column (CreatedAt + ParkingMinutes), so an API may leave it out.
        validUntil:
            raw.validUntil ?? new Date(raw.createdAt.getTime() + raw.parkingMinutes * minuteInMs),
        payment: { status: statusForRaw[raw.paymentStatus] },
        fiscal: { status: statusForRaw[raw.fiscalStatus] },
    }
}

export function toTicketDetail(raw: TicketDetailResponse): TicketDetail {
    return {
        ...toTicket(raw),
        transactionId: String(raw.transactionId),
        vat: {
            base: raw.osnovica ?? null,
            rate: raw.stopaPDV ?? null,
            amount: raw.iznosPDV ?? null,
        },
        fiscal: {
            status: statusForRaw[raw.fiscalStatus],
            jir: raw.jir ?? null,
            zki: raw.zki ?? null,
            fiscalizedAt: raw.fiscalizedAt ?? null,
            lastError: raw.fiscalLastError ?? null,
        },
    }
}

export function toTicketPage(raw: TicketPageResponse): TicketPage {
    return {
        items: raw.items.map(toTicket),
        page: raw.page,
        pageSize: raw.pageSize,
        totalCount: raw.totalCount,
    }
}

// Without createdFrom: the new-ticket count starts from createdAfter instead.
function toFilterQuery(filters: TicketFilters) {
    return {
        plate: filters.plate,
        createdTo: filters.createdTo?.toISOString(),
        zoneId: filters.zoneId,
        fiscalStatus:
            filters.fiscalStatus === undefined ? undefined : rawForStatus[filters.fiscalStatus],
    }
}

export function toTicketListQuery({ page, pageSize, sort, filters }: TicketListParams) {
    return {
        page,
        pageSize,
        sortBy: rawSortKey[sort.key],
        sortDir: sort.direction,
        createdFrom: filters.createdFrom?.toISOString(),
        ...toFilterQuery(filters),
    }
}

/** The new-ticket count's query: tickets after `createdAfter` that match the list's filters. */
export function toNewTicketCountQuery(createdAfter: Date, filters: TicketFilters) {
    return { createdAfter: createdAfter.toISOString(), ...toFilterQuery(filters) }
}
