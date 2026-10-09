import { z } from 'zod'

import type { Page } from '@/shared/lib/pageRange'
import {
    rawProcessingStatusSchema,
    toProcessingStatus,
    toRawProcessingStatus,
    type ProcessingStatus,
} from '@/shared/lib/processingStatus'
import type { TicketFilters } from '@/shared/lib/ticketFilterValues'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { utcDateTimeSchema } from '@/shared/lib/utcDateTime'

const dailyTicketFields = {
    ticketId: z.string(),
    createdAt: utcDateTimeSchema,
    vehicleRegistration: z.string(),
    zoneId: z.number(),
    zoneCode: z.string(),
    address: z.string().nullish(),
    inspectorId: z.number(),
    inspectorName: z.string(),
    inspectorSurname: z.string(),
    amount: z.number(),
    fiscalStatus: rawProcessingStatusSchema,
}

const dailyTicketResponseSchema = z.object(dailyTicketFields)

export const dailyTicketDetailResponseSchema = z.object({
    ...dailyTicketFields,
    jir: z.string().nullish(),
    zki: z.string().nullish(),
    fiscalizedAt: utcDateTimeSchema.nullish(),
    fiscalLastError: z.string().nullish(),
    photos: z.array(z.object({ photoId: z.string(), url: z.string() })).default([]),
})

export const dailyTicketPageResponseSchema = z.object({
    items: z.array(dailyTicketResponseSchema),
    page: z.number(),
    pageSize: z.number(),
    totalCount: z.number(),
})

type DailyTicketResponse = z.output<typeof dailyTicketResponseSchema>

type DailyTicketDetailResponse = z.output<typeof dailyTicketDetailResponseSchema>

export interface DailyTicket {
    id: string
    createdAt: Date
    plate: string
    zone: { id: number; code: string }
    /** Where the inspector found the vehicle; the spec does not store it yet. */
    address: string | null
    /** "Marko Horvat": the name as the list and detail show it. */
    inspector: { id: number; name: string }
    /** EUR at the API's full precision; rounded only when shown. */
    amount: number
    fiscal: { status: ProcessingStatus }
}

export interface VehiclePhoto {
    id: string
    url: string
}

export interface DailyTicketDetail extends DailyTicket {
    fiscal: {
        status: ProcessingStatus
        jir: string | null
        zki: string | null
        fiscalizedAt: Date | null
        /** The fiscal service's own text, shown as it comes. */
        lastError: string | null
    }
    photos: VehiclePhoto[]
}

export type DailyTicketPage = Page<DailyTicket>

export type DailyTicketSortKey = 'createdAt' | 'plate' | 'inspector'

export interface DailyTicketListParams {
    page: number
    pageSize: number
    sort: Sort<DailyTicketSortKey>
    filters: TicketFilters
}

const rawSortKey: Record<DailyTicketSortKey, string> = {
    createdAt: 'createdAt',
    plate: 'vehicleRegistration',
    inspector: 'inspector',
}

function toDailyTicket(raw: DailyTicketResponse): DailyTicket {
    return {
        id: raw.ticketId,
        createdAt: raw.createdAt,
        plate: raw.vehicleRegistration,
        zone: { id: raw.zoneId, code: raw.zoneCode },
        address: raw.address ?? null,
        inspector: { id: raw.inspectorId, name: `${raw.inspectorName} ${raw.inspectorSurname}` },
        amount: raw.amount,
        fiscal: { status: toProcessingStatus(raw.fiscalStatus) },
    }
}

export function toDailyTicketDetail(raw: DailyTicketDetailResponse): DailyTicketDetail {
    return {
        ...toDailyTicket(raw),
        fiscal: {
            status: toProcessingStatus(raw.fiscalStatus),
            jir: raw.jir ?? null,
            zki: raw.zki ?? null,
            fiscalizedAt: raw.fiscalizedAt ?? null,
            lastError: raw.fiscalLastError ?? null,
        },
        photos: raw.photos.map(({ photoId, url }) => ({ id: photoId, url })),
    }
}

export function toDailyTicketPage(raw: z.output<typeof dailyTicketPageResponseSchema>) {
    return {
        items: raw.items.map(toDailyTicket),
        page: raw.page,
        pageSize: raw.pageSize,
        totalCount: raw.totalCount,
    } satisfies DailyTicketPage
}

export function toDailyTicketListQuery({ page, pageSize, sort, filters }: DailyTicketListParams) {
    return {
        page,
        pageSize,
        sortBy: rawSortKey[sort.key],
        sortDir: sort.direction,
        plate: filters.plate,
        createdFrom: filters.createdFrom?.toISOString(),
        createdTo: filters.createdTo?.toISOString(),
        zoneId: filters.zoneId,
        fiscalStatus:
            filters.fiscalStatus === undefined
                ? undefined
                : toRawProcessingStatus(filters.fiscalStatus),
    }
}

/** A list row as the detail now has it, so the list shows what the detail shows. */
export function toListItem(detail: DailyTicketDetail): DailyTicket {
    const { id, createdAt, plate, zone, address, inspector, amount, fiscal } = detail

    return {
        id,
        createdAt,
        plate,
        zone,
        address,
        inspector,
        amount,
        fiscal: { status: fiscal.status },
    }
}
