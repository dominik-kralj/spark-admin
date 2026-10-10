import { describe, expect, it } from 'vitest'

import {
    reportPreviewResponseSchema,
    toReportPreview,
    toReportQuery,
    toReportRecipient,
} from './report'

describe('toReportQuery', () => {
    it('sends the days as Zagreb instants, the end exclusive, and the zone', () => {
        expect(
            toReportQuery({
                reportKey: 'revenue',
                from: { year: 2026, month: 9, day: 1 },
                to: { year: 2026, month: 9, day: 30 },
                zoneId: 2,
            }),
        ).toEqual({
            dateFrom: '2026-08-31T22:00:00.000Z',
            dateTo: '2026-09-30T22:00:00.000Z',
            zoneId: 2,
        })
    })

    it('leaves the zone out for every zone', () => {
        expect(
            toReportQuery({
                reportKey: 'revenue',
                from: { year: 2026, month: 12, day: 1 },
                to: { year: 2026, month: 12, day: 31 },
                zoneId: null,
            }),
        ).toEqual({ dateFrom: '2026-11-30T23:00:00.000Z', dateTo: '2026-12-31T23:00:00.000Z' })
    })
})

describe('toReportPreview', () => {
    const raw = reportPreviewResponseSchema.parse({
        columns: [
            { key: 'zone', label: 'Zona', type: 'text' },
            { key: 'tickets', label: 'Karte', type: 'count' },
            { key: 'revenue', label: 'Prihod', type: 'amount' },
        ],
        rows: [
            { zone: 'ZONA1', tickets: 12, revenue: 8.4 },
            { revenue: 1.4, zone: '2A' },
        ],
        totals: { tickets: 12, revenue: 9.8 },
    })

    it('puts each row in column order, with null where a value is missing', () => {
        const preview = toReportPreview(raw)

        expect(preview.columns.map((column) => column.type)).toEqual(['text', 'count', 'amount'])
        expect(preview.rows).toEqual([
            ['ZONA1', 12, 8.4],
            ['2A', null, 1.4],
        ])
        expect(preview.totals).toEqual([null, 12, 9.8])
    })

    it('keeps a report without a total row', () => {
        expect(toReportPreview({ ...raw, totals: null }).totals).toBeNull()
    })
})

describe('toReportRecipient', () => {
    it("reads the city's name and its preset report address", () => {
        expect(
            toReportRecipient({ tenantName: 'Grad Samobor', reportEmail: 'promet@samobor.hr' }),
        ).toEqual({ cityName: 'Grad Samobor', email: 'promet@samobor.hr' })
    })

    it('reads a missing or blank address as none', () => {
        expect(toReportRecipient({ tenantName: 'Grad Samobor' }).email).toBeNull()
        expect(toReportRecipient({ tenantName: 'Grad Samobor', reportEmail: ' ' }).email).toBeNull()
    })
})
