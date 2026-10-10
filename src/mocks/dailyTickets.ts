import { delay, http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminUser } from './adminAccount'
import { notFound, validationProblem } from './responses'
import { createSeededRandom } from './seededRandom'
import { apiUrl } from './url'

type Status = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAIL'

interface Photo {
    photoId: string
    url: string
}

/** A TICKETS row of type Dnevna in camelCase, with its zone code, inspector and photos joined. */
interface DailyTicketRow {
    ticketId: string
    tenantId: number
    createdAt: string
    vehicleRegistration: string
    zoneId: number
    zoneCode: string
    address: string | null
    inspectorId: number
    inspectorName: string
    inspectorSurname: string
    amount: number
    fiscalStatus: Status
    jir: string | null
    zki: string | null
    fiscalizedAt: string | null
    fiscalLastError: string | null
    photos: Photo[]
    /** Mock only: fiscalizing again fails again, so the screen's failure path can be seen. */
    failsAgain: boolean
}

const seedSize = 60
const minuteInMs = 60_000
const fiscalDelayMs = 5_000
const dailyTicketPrice = 15
const fiscalError = 's005: Porezna uprava nije odgovorila u zadanom roku (10 s).'

const { random, pick, hex, guid, plate: randomPlate, weighted } = createSeededRandom(2027)

const zones = [
    { zoneId: 1, zoneCode: 'ZONA1' },
    { zoneId: 2, zoneCode: '2A' },
] as const

const inspectors = [
    { inspectorId: 1, inspectorName: 'Marko', inspectorSurname: 'Horvat' },
    { inspectorId: 2, inspectorName: 'Petra', inspectorSurname: 'Novak' },
    { inspectorId: 3, inspectorName: 'Davor', inspectorSurname: 'Šimić' },
] as const

const streets = [
    'Trg kralja Tomislava',
    'Perkovčeva ulica',
    'Livadićeva ulica',
    'Ulica Ljudevita Gaja',
    'Starogradska ulica',
    'Ulica Milana Langa',
    'Gajeva ulica',
    'Šmidhenova ulica',
]

type PhotoKind = 'three' | 'none' | 'broken'

// The design's rows, newest first; times are Zagreb local (UTC+2 in October).
const designRows = [
    ['06', '09:05', 'ZG5553AI', 1, 'Trg kralja Tomislava 5', 1, 'DONE', 'three'],
    ['06', '08:48', 'ZG9087KL', 2, 'Perkovčeva ulica 12', 1, 'FAIL', 'three'],
    ['06', '08:31', 'KA4410CD', 1, 'Livadićeva ulica 3', 2, 'DONE', 'none'],
    ['06', '08:12', 'ZG2271MN', 1, 'Ulica Ljudevita Gaja 8', 1, 'PROCESSING', 'three'],
    ['05', '17:40', 'ST8032PV', 2, 'Starogradska ulica 21', 2, 'DONE', 'broken'],
    ['05', '16:22', 'ZG6140TR', 1, 'Ulica Milana Langa 14', 1, 'FAIL', 'three'],
    ['05', '15:03', 'ZG3358EH', 2, 'Perkovčeva ulica 30', 2, 'DONE', 'three'],
    ['05', '13:47', 'KR731HJ', 1, 'Trg kralja Tomislava 11', 1, 'PENDING', 'three'],
] as const

/** A stand-in photo: an SVG with the plate, so each one is told apart on screen. */
function photoUrl(plate: string, index: number): string {
    const shade = ['#C9D3DE', '#B8C4D1', '#D5DCE4'][index] ?? '#C9D3DE'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${shade}"/><path d="M160 380l50-110h380l50 110v80H160z" fill="#56606E"/><circle cx="260" cy="460" r="45" fill="#2B3440"/><circle cx="540" cy="460" r="45" fill="#2B3440"/><rect x="300" y="390" width="200" height="50" rx="6" fill="#fff" stroke="#03112D" stroke-width="4"/><text x="400" y="425" font-family="monospace" font-size="30" text-anchor="middle" fill="#03112D">${plate}</text></svg>`

    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function photosFor(plate: string, kind: PhotoKind): Photo[] {
    if (kind === 'none') return []

    return [0, 1, 2].map((index) => ({
        photoId: guid(),
        // A link that no longer works: the image fails to load.
        url:
            kind === 'broken' && index === 1
                ? 'data:image/jpeg;base64,AAAA'
                : photoUrl(plate, index),
    }))
}

interface RowInput {
    createdAt: Date
    plate: string
    zoneId: number
    address: string | null
    inspectorId: number
    fiscalStatus: Status
    photos: PhotoKind
}

function toRow(input: RowInput, tenantId: number): DailyTicketRow {
    const zone = zones.find((candidate) => candidate.zoneId === input.zoneId) ?? zones[0]
    const inspector =
        inspectors.find((candidate) => candidate.inspectorId === input.inspectorId) ?? inspectors[0]
    const isFiscalized = input.fiscalStatus === 'DONE'

    return {
        ticketId: guid(),
        tenantId,
        createdAt: input.createdAt.toISOString(),
        vehicleRegistration: input.plate,
        ...zone,
        address: input.address,
        ...inspector,
        amount: dailyTicketPrice,
        fiscalStatus: input.fiscalStatus,
        jir: isFiscalized ? guid() : null,
        // ZKI is signed before the call to CIS, so every attempt has one.
        zki: input.fiscalStatus === 'PENDING' ? null : hex(32),
        fiscalizedAt: isFiscalized
            ? new Date(input.createdAt.getTime() + fiscalDelayMs).toISOString()
            : null,
        fiscalLastError: input.fiscalStatus === 'FAIL' ? fiscalError : null,
        photos: photosFor(input.plate, input.photos),
        failsAgain: input.plate === 'ZG6140TR',
    }
}

function designInputs(): RowInput[] {
    return designRows.map(([day, time, plate, zoneId, address, inspectorId, status, photos]) => ({
        createdAt: new Date(`2026-10-${day}T${time}:00+02:00`),
        plate,
        zoneId,
        address,
        inspectorId,
        fiscalStatus: status,
        photos,
    }))
}

function generatedInputs(count: number, startBefore: Date): RowInput[] {
    let time = startBefore.getTime()

    return Array.from({ length: count }, () => {
        time -= (20 + Math.floor(random() * 160)) * minuteInMs

        return {
            createdAt: new Date(time),
            plate: randomPlate(),
            zoneId: pick([1, 1, 2]),
            address:
                random() < 0.05
                    ? null
                    : `${pick(streets)} ${String(1 + Math.floor(random() * 40))}`,
            inspectorId: pick([1, 1, 2, 3]),
            fiscalStatus: weighted<Status>({ DONE: 85, FAIL: 7, PENDING: 4, PROCESSING: 4 }),
            photos: 'three',
        }
    })
}

function seedDailyTickets(): DailyTicketRow[] {
    const design = designInputs()
    const [newest] = design
    const oldest = design.at(-1)
    if (newest === undefined || oldest === undefined) throw new Error('No design rows')
    const inputs = [...design, ...generatedInputs(seedSize - design.length, oldest.createdAt)]
    // Another city's DPK: hidden from the list and 404 by id.
    const otherCity = toRow(newest, 2)

    return [...inputs.map((input) => toRow(input, mockAdminUser.tenantId)), otherCity]
}

const seededDailyTickets: readonly DailyTicketRow[] = seedDailyTickets()

let dailyTickets: readonly DailyTicketRow[] = seededDailyTickets

export function resetDailyTickets(): void {
    dailyTickets = seededDailyTickets
}

function idOf(plate: string): string {
    return seededDailyTickets.find((row) => row.vehicleRegistration === plate)?.ticketId ?? ''
}

export const mockDailyTicketIds = {
    newest: idOf('ZG5553AI'),
    failed: idOf('ZG9087KL'),
    failsAgain: idOf('ZG6140TR'),
    processing: idOf('ZG2271MN'),
    noPhotos: idOf('KA4410CD'),
    brokenPhoto: idOf('ST8032PV'),
    otherCity: seededDailyTickets.at(-1)?.ticketId ?? '',
}

const statusSchema = z.enum(['PENDING', 'PROCESSING', 'DONE', 'FAIL'])
const instantSchema = z.iso.datetime({ offset: true })

const listQuerySchema = z.object({
    plate: z.string().optional(),
    createdFrom: instantSchema.optional(),
    createdTo: instantSchema.optional(),
    zoneId: z.coerce.number().int().optional(),
    fiscalStatus: statusSchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z.enum(['createdAt', 'vehicleRegistration', 'inspector']).default('createdAt'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
})

type ListQuery = z.output<typeof listQuerySchema>

function matches(row: DailyTicketRow, filters: ListQuery): boolean {
    const createdAt = Date.parse(row.createdAt)
    const checks = [
        filters.plate === undefined ||
            row.vehicleRegistration.includes(filters.plate.toLocaleUpperCase('hr')),
        filters.createdFrom === undefined || createdAt >= Date.parse(filters.createdFrom),
        filters.createdTo === undefined || createdAt < Date.parse(filters.createdTo),
        filters.zoneId === undefined || row.zoneId === filters.zoneId,
        filters.fiscalStatus === undefined || row.fiscalStatus === filters.fiscalStatus,
    ]

    return checks.every(Boolean)
}

function sortValue(row: DailyTicketRow, sortBy: ListQuery['sortBy']): string {
    if (sortBy === 'inspector') return `${row.inspectorSurname} ${row.inspectorName}`

    return row[sortBy]
}

function compareRows(sortBy: ListQuery['sortBy']) {
    return (a: DailyTicketRow, b: DailyTicketRow): number =>
        sortValue(a, sortBy).localeCompare(sortValue(b, sortBy), 'hr') ||
        a.createdAt.localeCompare(b.createdAt)
}

function toListItem(row: DailyTicketRow) {
    return {
        ticketId: row.ticketId,
        createdAt: row.createdAt,
        vehicleRegistration: row.vehicleRegistration,
        zoneId: row.zoneId,
        zoneCode: row.zoneCode,
        address: row.address,
        inspectorId: row.inspectorId,
        inspectorName: row.inspectorName,
        inspectorSurname: row.inspectorSurname,
        amount: row.amount,
        fiscalStatus: row.fiscalStatus,
    }
}

function toDetail(row: DailyTicketRow) {
    return {
        ...toListItem(row),
        jir: row.jir,
        zki: row.zki,
        fiscalizedAt: row.fiscalizedAt,
        fiscalLastError: row.fiscalLastError,
        photos: row.photos,
    }
}

function findOwn(ticketId: unknown): DailyTicketRow | undefined {
    return dailyTickets.find(
        (row) => row.ticketId === ticketId && row.tenantId === mockAdminUser.tenantId,
    )
}

function fiscalizedAgain(row: DailyTicketRow): DailyTicketRow {
    if (row.failsAgain) return { ...row, zki: hex(32), fiscalLastError: fiscalError }

    return {
        ...row,
        fiscalStatus: 'DONE',
        jir: guid(),
        zki: hex(32),
        fiscalizedAt: new Date().toISOString(),
        fiscalLastError: null,
    }
}

const conflict = (code: string) => HttpResponse.json({ status: 409, code }, { status: 409 })

export const dailyTicketHandlers = [
    http.get(apiUrl('/daily-tickets'), ({ request }) => {
        const parsed = listQuerySchema.safeParse(
            Object.fromEntries(new URL(request.url).searchParams),
        )
        if (!parsed.success) return validationProblem(parsed.error)

        const { page, pageSize, sortBy, sortDir } = parsed.data
        const sorted = dailyTickets
            .filter((row) => row.tenantId === mockAdminUser.tenantId && matches(row, parsed.data))
            .toSorted(compareRows(sortBy))
        const ordered = sortDir === 'asc' ? sorted : sorted.reverse()
        const start = (page - 1) * pageSize

        return HttpResponse.json({
            items: ordered.slice(start, start + pageSize).map(toListItem),
            page,
            pageSize,
            totalCount: ordered.length,
        })
    }),

    http.get(apiUrl('/daily-tickets/:ticketId'), ({ params }) => {
        const row = findOwn(params.ticketId)
        if (row === undefined) return notFound()

        return HttpResponse.json(toDetail(row))
    }),

    http.post(apiUrl('/daily-tickets/:ticketId/fiscalize'), async ({ params }) => {
        const row = findOwn(params.ticketId)
        if (row === undefined) return notFound()
        if (row.fiscalStatus === 'DONE') return conflict('alreadyFiscalized')
        if (row.fiscalStatus !== 'FAIL') return conflict('fiscalizationInProgress')

        // The call to the tax authority's CIS takes a moment.
        await delay()
        const updated = fiscalizedAgain(row)
        dailyTickets = dailyTickets.map((candidate) =>
            candidate.ticketId === row.ticketId ? updated : candidate,
        )

        return HttpResponse.json(toDetail(updated))
    }),
]
