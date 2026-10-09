import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminUser } from './adminUsers'
import { notFound, validationProblem } from './responses'
import { apiUrl } from './url'

type Status = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAIL'

/** A TICKETS row in camelCase, plus the zone code the list shows. */
interface TicketRow {
    ticketId: string
    transactionId: number
    tenantId: number
    ticketType: 'Standard'
    vehicleRegistration: string
    zoneId: number
    zoneCode: string
    parkingMinutes: number
    amount: number
    osnovica: number
    stopaPDV: number
    iznosPDV: number
    createdAt: string
    paymentStatus: Status
    fiscalStatus: Status
    jir: string | null
    zki: string | null
    fiscalizedAt: string | null
    fiscalLastError: string | null
}

const seedSize = 300
const vatRate = 25
const minuteInMs = 60_000
const fiscalDelayMs = 5_000

const zones = [
    { zoneId: 1, zoneCode: 'ZONA1', pricePerHour: 0.7 },
    { zoneId: 2, zoneCode: '2A', pricePerHour: 0.5 },
] as const

// The design's rows, newest first; times are Zagreb local (UTC+2 in October).
const designRows = [
    ['09:14', 'ZG1234AB', 1, 60, 'DONE', 'DONE'],
    ['09:11', 'ZG5553AI', 2, 120, 'DONE', 'PROCESSING'],
    ['09:07', 'ZG9087KL', 1, 60, 'PROCESSING', 'PENDING'],
    ['09:02', 'KA4410CD', 1, 60, 'DONE', 'FAIL'],
    ['08:58', 'ZG2271MN', 2, 60, 'FAIL', 'PENDING'],
    ['08:51', 'ST8032PV', 1, 120, 'DONE', 'DONE'],
    ['08:47', 'ZG6140TR', 2, 60, 'DONE', 'DONE'],
    ['08:40', 'ZG3358EH', 1, 60, 'PENDING', 'PENDING'],
] as const

/** Mulberry32: the same seed gives the same tickets on every run. */
function createRandom(seed: number): () => number {
    let state = seed

    return () => {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const random = createRandom(2026)

function pick<T>(items: readonly T[]): T {
    return items[Math.floor(random() * items.length)] as T
}

function hex(length: number): string {
    return Array.from({ length }, () => Math.floor(random() * 16).toString(16)).join('')
}

function guid(): string {
    return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`
}

const plateLetters = 'ABCDEFGHIJKLMNOPRSTUVZ'

function randomPlate(): string {
    const letter = () => plateLetters.charAt(Math.floor(random() * plateLetters.length))
    const digits = Array.from({ length: random() < 0.7 ? 4 : 3 }, () =>
        String(Math.floor(random() * 10)),
    ).join('')

    return `${pick(['ZG', 'ZG', 'ZG', 'ST', 'RI', 'KA', 'OS', 'VŽ'])}${digits}${letter()}${random() < 0.8 ? letter() : ''}`
}

function weighted(weights: Record<Status, number>): Status {
    let roll = random() * Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    for (const [status, weight] of Object.entries(weights) as [Status, number][]) {
        roll -= weight
        if (roll < 0) return status
    }

    return 'DONE'
}

const round = (value: number, decimals: number) => Number(value.toFixed(decimals))

interface RowInput {
    createdAt: Date
    plate: string
    zoneId: number
    parkingMinutes: number
    paymentStatus: Status
    fiscalStatus: Status
}

function toRow(input: RowInput, transactionId: number, tenantId: number): TicketRow {
    const zone = zones.find((candidate) => candidate.zoneId === input.zoneId) ?? zones[0]
    const amount = round((zone.pricePerHour * input.parkingMinutes) / 60, 2)
    const osnovica = round(amount / (1 + vatRate / 100), 6)
    const isFiscalized = input.fiscalStatus === 'DONE'

    return {
        ticketId: guid(),
        transactionId,
        tenantId,
        ticketType: 'Standard',
        vehicleRegistration: input.plate,
        zoneId: zone.zoneId,
        zoneCode: zone.zoneCode,
        parkingMinutes: input.parkingMinutes,
        amount,
        osnovica,
        stopaPDV: vatRate,
        iznosPDV: round(amount - osnovica, 6),
        createdAt: input.createdAt.toISOString(),
        paymentStatus: input.paymentStatus,
        fiscalStatus: input.fiscalStatus,
        jir: isFiscalized ? guid() : null,
        // ZKI is signed before the call to CIS, so every attempt has one.
        zki: input.fiscalStatus === 'PENDING' ? null : hex(32),
        fiscalizedAt: isFiscalized
            ? new Date(input.createdAt.getTime() + fiscalDelayMs).toISOString()
            : null,
        fiscalLastError:
            input.fiscalStatus === 'FAIL'
                ? 's005: Porezna uprava nije odgovorila u zadanom roku (10 s).'
                : null,
    }
}

function designInputs(): RowInput[] {
    return designRows.map(([time, plate, zoneId, parkingMinutes, paymentStatus, fiscalStatus]) => ({
        createdAt: new Date(`2026-10-06T${time}:00+02:00`),
        plate,
        zoneId,
        parkingMinutes,
        paymentStatus,
        fiscalStatus,
    }))
}

function generatedInputs(count: number, startBefore: Date): RowInput[] {
    let time = startBefore.getTime()

    return Array.from({ length: count }, () => {
        time -= (3 + Math.floor(random() * 25)) * minuteInMs
        const paymentStatus = weighted({ DONE: 86, FAIL: 8, PENDING: 3, PROCESSING: 3 })

        return {
            createdAt: new Date(time),
            plate: randomPlate(),
            zoneId: pick([1, 1, 2]),
            parkingMinutes: pick([60, 60, 60, 120, 180]),
            paymentStatus,
            // Fiscalization starts only once the payment is done.
            fiscalStatus:
                paymentStatus === 'DONE'
                    ? weighted({ DONE: 88, FAIL: 6, PENDING: 3, PROCESSING: 3 })
                    : 'PENDING',
        }
    })
}

function seedTickets(): TicketRow[] {
    const design = designInputs()
    const [newest] = design
    const oldest = design.at(-1)
    if (newest === undefined || oldest === undefined) throw new Error('No design rows')
    const inputs = [...design, ...generatedInputs(seedSize - design.length, oldest.createdAt)]
    const firstTransactionId = 100_000

    const ownRows = inputs.map((input, index) =>
        toRow(input, firstTransactionId + seedSize - index, mockAdminUser.tenantId),
    )
    // Another city's ticket: hidden from the list and 404 by id.
    const otherCity = toRow(newest, 1, 2)

    return [...ownRows, otherCity]
}

const seededTickets: readonly TicketRow[] = seedTickets()

let tickets: readonly TicketRow[] = seededTickets
let nextTransactionId = 100_000 + seedSize + 1

export function resetTickets(): void {
    tickets = seededTickets
    nextTransactionId = 100_000 + seedSize + 1
}

/** A driver pays for a ticket now, in this city: it is the newest one from then on. */
export function addMockTicket({ plate, zoneId }: { plate: string; zoneId: number }): void {
    const row = toRow(
        {
            createdAt: new Date(),
            plate,
            zoneId,
            parkingMinutes: 60,
            paymentStatus: 'DONE',
            fiscalStatus: 'PENDING',
        },
        nextTransactionId,
        mockAdminUser.tenantId,
    )
    nextTransactionId += 1
    tickets = [row, ...tickets]
}

export const mockTicketIds = {
    newest: seededTickets[0]?.ticketId ?? '',
    fiscalFailed:
        seededTickets.find((row) => row.vehicleRegistration === 'KA4410CD')?.ticketId ?? '',
    otherCity: seededTickets.at(-1)?.ticketId ?? '',
}

const statusSchema = z.enum(['PENDING', 'PROCESSING', 'DONE', 'FAIL'])
const instantSchema = z.iso.datetime({ offset: true })

const filterSchema = z.object({
    plate: z.string().optional(),
    createdTo: instantSchema.optional(),
    zoneId: z.coerce.number().int().optional(),
    fiscalStatus: statusSchema.optional(),
})

const listQuerySchema = filterSchema.extend({
    createdFrom: instantSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z
        .enum(['createdAt', 'vehicleRegistration', 'amount', 'validUntil'])
        .default('createdAt'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
})

const newCountQuerySchema = filterSchema.extend({ createdAfter: instantSchema })

type Filters = z.output<typeof filterSchema> & {
    createdFrom?: string | undefined
    createdAfter?: string | undefined
}

function matches(row: TicketRow, filters: Filters): boolean {
    const createdAt = Date.parse(row.createdAt)
    const checks = [
        filters.plate === undefined ||
            row.vehicleRegistration.includes(filters.plate.toLocaleUpperCase('hr')),
        filters.createdFrom === undefined || createdAt >= Date.parse(filters.createdFrom),
        filters.createdAfter === undefined || createdAt > Date.parse(filters.createdAfter),
        filters.createdTo === undefined || createdAt < Date.parse(filters.createdTo),
        filters.zoneId === undefined || row.zoneId === filters.zoneId,
        filters.fiscalStatus === undefined || row.fiscalStatus === filters.fiscalStatus,
    ]

    return checks.every(Boolean)
}

function cityTickets(filters: Filters): TicketRow[] {
    return tickets.filter((row) => row.tenantId === mockAdminUser.tenantId && matches(row, filters))
}

function validUntil(row: TicketRow): string {
    return new Date(Date.parse(row.createdAt) + row.parkingMinutes * minuteInMs).toISOString()
}

type SortBy = z.output<typeof listQuerySchema>['sortBy']

function sortValue(row: TicketRow, sortBy: SortBy): string | number {
    if (sortBy === 'validUntil') return validUntil(row)

    return row[sortBy]
}

function compareRows(sortBy: SortBy) {
    return (a: TicketRow, b: TicketRow): number => {
        const left = sortValue(a, sortBy)
        const right = sortValue(b, sortBy)
        if (left !== right) return left < right ? -1 : 1

        return a.transactionId - b.transactionId
    }
}

function toListItem(row: TicketRow) {
    return {
        ticketId: row.ticketId,
        ticketType: row.ticketType,
        createdAt: row.createdAt,
        vehicleRegistration: row.vehicleRegistration,
        zoneId: row.zoneId,
        zoneCode: row.zoneCode,
        parkingMinutes: row.parkingMinutes,
        amount: row.amount,
        validUntil: validUntil(row),
        paymentStatus: row.paymentStatus,
        fiscalStatus: row.fiscalStatus,
    }
}

function toDetail(row: TicketRow) {
    return {
        ...toListItem(row),
        transactionId: row.transactionId,
        osnovica: row.osnovica,
        stopaPDV: row.stopaPDV,
        iznosPDV: row.iznosPDV,
        jir: row.jir,
        zki: row.zki,
        fiscalizedAt: row.fiscalizedAt,
        fiscalLastError: row.fiscalLastError,
    }
}

function searchParams(request: Request): Record<string, string> {
    return Object.fromEntries(new URL(request.url).searchParams)
}

export const ticketHandlers = [
    http.get(apiUrl('/tickets'), ({ request }) => {
        const parsed = listQuerySchema.safeParse(searchParams(request))
        if (!parsed.success) return validationProblem(parsed.error)

        const { page, pageSize, sortBy, sortDir, ...filters } = parsed.data
        const sorted = cityTickets(filters).toSorted(compareRows(sortBy))
        const ordered = sortDir === 'asc' ? sorted : sorted.reverse()
        const start = (page - 1) * pageSize

        return HttpResponse.json({
            items: ordered.slice(start, start + pageSize).map(toListItem),
            page,
            pageSize,
            totalCount: ordered.length,
        })
    }),

    http.get(apiUrl('/tickets/new-count'), ({ request }) => {
        const parsed = newCountQuerySchema.safeParse(searchParams(request))
        if (!parsed.success) return validationProblem(parsed.error)

        return HttpResponse.json({ count: cityTickets(parsed.data).length })
    }),

    http.get(apiUrl('/tickets/:ticketId'), ({ params }) => {
        const row = tickets.find(
            (ticket) =>
                ticket.ticketId === params.ticketId && ticket.tenantId === mockAdminUser.tenantId,
        )
        if (row === undefined) return notFound()

        return HttpResponse.json(toDetail(row))
    }),
]
