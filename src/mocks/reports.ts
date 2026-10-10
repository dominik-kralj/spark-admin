import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { notFound, validationProblem } from './responses'
import { createSeededRandom } from './seededRandom'
import { apiUrl } from './url'

// Sample reports until the real list is defined (api-contract.md D14); the screen reads any set.
const reports = [
    { reportKey: 'revenue-by-zone', name: 'Prihod po zonama' },
    { reportKey: 'revenue-by-day', name: 'Naplata po danima' },
    { reportKey: 'daily-tickets', name: 'Dnevne parkirne karte' },
] as const

type ReportKey = (typeof reports)[number]['reportKey']

// The seeded zones of Grad Samobor (mocks/zones.ts), with their hourly price.
const cityZones = [
    { zoneId: 1, zoneCode: 'ZONA1', price: 0.7, dailyTicketPrice: 15 },
    { zoneId: 2, zoneCode: '2A', price: 0.5, dailyTicketPrice: 15 },
]

const dayInMs = 24 * 60 * 60 * 1000
const zagrebOffsetMs = 2 * 60 * 60 * 1000

const reportParamsSchema = z
    .object({
        dateFrom: z.iso.datetime(),
        dateTo: z.iso.datetime(),
        zoneId: z.coerce.number().int().positive().optional(),
    })
    .refine(({ dateFrom, dateTo }) => dateFrom < dateTo, { path: ['dateTo'] })

type ReportParams = z.output<typeof reportParamsSchema>

type Row = Record<string, string | number>

const round2 = (amount: number) => Math.round(amount * 100) / 100

function sum(rows: Row[], key: string): number {
    return round2(rows.reduce((total, row) => total + Number(row[key] ?? 0), 0))
}

function findReport(reportKey: unknown) {
    return reports.find((report) => report.reportKey === reportKey)
}

function readQuery(url: string) {
    return reportParamsSchema.safeParse(Object.fromEntries(new URL(url).searchParams))
}

/** Each day of the range as YYYY-MM-DD in Zagreb; close enough for sample data. */
function daysOf({ dateFrom, dateTo }: ReportParams): string[] {
    const start = Date.parse(dateFrom) + zagrebOffsetMs
    const count = Math.round((Date.parse(dateTo) - Date.parse(dateFrom)) / dayInMs)

    return Array.from({ length: count }, (_, index) =>
        new Date(start + index * dayInMs).toISOString().slice(0, 10),
    )
}

/** The same day and zone always give the same numbers, so a report reads the same twice. */
function dayInZone(day: string, zoneId: number) {
    const random = createSeededRandom(Number(day.replaceAll('-', '')) * 10 + zoneId).random
    const weekday = new Date(`${day}T12:00:00Z`).getUTCDay()
    const isSunday = weekday === 0
    // Sunday is quiet and Saturday half busy, as in a town centre.
    const busy = [0.3, 1, 1, 1, 1, 1, 0.7][weekday] ?? 1
    const tickets = Math.round((40 + random() * 50) * busy * (zoneId === 1 ? 1.4 : 1))
    const hours = 1 + random() * 1.5
    const dailyTickets = isSunday ? 0 : Math.floor(random() * 4)
    const failed = dailyTickets > 0 && random() < 0.15 ? 1 : 0

    return { tickets, hours, dailyTickets, failed }
}

function zonesFor({ zoneId }: ReportParams) {
    return cityZones.filter((zone) => zoneId === undefined || zone.zoneId === zoneId)
}

const previews: Record<ReportKey, (params: ReportParams) => { columns: unknown[]; rows: Row[] }> = {
    'revenue-by-zone': (params) => ({
        columns: [
            { key: 'zone', label: 'Zona', type: 'text' },
            { key: 'tickets', label: 'Plaćene karte', type: 'count' },
            { key: 'dailyTickets', label: 'DPK', type: 'count' },
            { key: 'revenue', label: 'Prihod', type: 'amount' },
            { key: 'vat', label: 'Od toga PDV', type: 'amount' },
        ],
        rows: zonesFor(params).map((zone) => {
            const days = daysOf(params).map((day) => dayInZone(day, zone.zoneId))
            const tickets = days.reduce((total, day) => total + day.tickets, 0)
            const dailyTickets = days.reduce((total, day) => total + day.dailyTickets, 0)
            const revenue = round2(
                days.reduce(
                    (total, day) =>
                        total +
                        day.tickets * day.hours * zone.price +
                        day.dailyTickets * zone.dailyTicketPrice,
                    0,
                ),
            )

            return {
                zone: zone.zoneCode,
                tickets,
                dailyTickets,
                revenue,
                vat: round2(revenue * 0.2),
            }
        }),
    }),
    'revenue-by-day': (params) => ({
        columns: [
            { key: 'day', label: 'Datum', type: 'date' },
            { key: 'tickets', label: 'Plaćene karte', type: 'count' },
            { key: 'revenue', label: 'Prihod', type: 'amount' },
        ],
        rows: daysOf(params).map((day) => {
            const zones = zonesFor(params).map((zone) => ({
                zone,
                ...dayInZone(day, zone.zoneId),
            }))

            return {
                day,
                tickets: zones.reduce((total, entry) => total + entry.tickets, 0),
                revenue: round2(
                    zones.reduce(
                        (total, entry) => total + entry.tickets * entry.hours * entry.zone.price,
                        0,
                    ),
                ),
            }
        }),
    }),
    'daily-tickets': (params) => ({
        columns: [
            { key: 'zone', label: 'Zona', type: 'text' },
            { key: 'issued', label: 'Izdano', type: 'count' },
            { key: 'fiscalized', label: 'Fiskalizirano', type: 'count' },
            { key: 'failed', label: 'Neuspjelo', type: 'count' },
            { key: 'amount', label: 'Iznos', type: 'amount' },
        ],
        rows: zonesFor(params).map((zone) => {
            const days = daysOf(params).map((day) => dayInZone(day, zone.zoneId))
            const issued = days.reduce((total, day) => total + day.dailyTickets, 0)
            const failed = days.reduce((total, day) => total + day.failed, 0)

            return {
                zone: zone.zoneCode,
                issued,
                fiscalized: issued - failed,
                failed,
                amount: round2(issued * zone.dailyTicketPrice),
            }
        }),
    }),
}

function previewOf(reportKey: ReportKey, params: ReportParams) {
    const { columns, rows } = previews[reportKey](params)
    const totalKeys = Object.keys(rows[0] ?? {}).filter((key) => typeof rows[0]?.[key] === 'number')
    const totals =
        rows.length > 1 ? Object.fromEntries(totalKeys.map((key) => [key, sum(rows, key)])) : null

    return { columns, rows, totals }
}

/** A one-page PDF with the report's name, so a downloaded file opens. */
function pdfOf(name: string): Uint8Array {
    const stream = `BT /F1 18 Tf 72 760 Td (${name.replace(/[^\x20-\x7e]/g, '?')}) Tj ET`
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
        `<< /Length ${String(stream.length)} >>\nstream\n${stream}\nendstream`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ]
    let pdf = '%PDF-1.4\n'
    const offsets = objects.map((object, index) => {
        const offset = pdf.length
        pdf += `${String(index + 1)} 0 obj\n${object}\nendobj\n`

        return offset
    })
    const xref = pdf.length
    pdf += `xref\n0 ${String(objects.length + 1)}\n0000000000 65535 f \n`
    pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
    pdf += `trailer\n<< /Size ${String(objects.length + 1)} /Root 1 0 R >>\nstartxref\n${String(xref)}\n%%EOF\n`

    return new TextEncoder().encode(pdf)
}

export const reportHandlers = [
    http.get(apiUrl('/reports'), () => HttpResponse.json(reports)),

    http.get(apiUrl('/reports/:reportKey/preview'), ({ params, request }) => {
        const report = findReport(params.reportKey)
        if (report === undefined) return notFound()
        const query = readQuery(request.url)
        if (!query.success) return validationProblem(query.error)

        return HttpResponse.json(previewOf(report.reportKey, query.data))
    }),

    http.get(apiUrl('/reports/:reportKey/pdf'), ({ params, request }) => {
        const report = findReport(params.reportKey)
        if (report === undefined) return notFound()
        const query = readQuery(request.url)
        if (!query.success) return validationProblem(query.error)

        return new HttpResponse(pdfOf(report.name), {
            headers: { 'Content-Type': 'application/pdf' },
        })
    }),

    http.post(apiUrl('/reports/:reportKey/email'), async ({ params, request }) => {
        if (findReport(params.reportKey) === undefined) return notFound()
        const body = reportParamsSchema.safeParse(await request.json())
        if (!body.success) return validationProblem(body.error)

        return new HttpResponse(null, { status: 202 })
    }),
]
