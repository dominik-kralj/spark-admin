import { describe, expect, it } from 'vitest'

import { reportFormSchema, toReportFormValues, type ReportFormValues } from './reportForm'

const validValues: ReportFormValues = {
    reportKey: 'revenue',
    from: '01.09.2026',
    to: '30.09.2026',
    zoneId: '',
}

function firstMessage(values: Partial<ReportFormValues>, field: keyof ReportFormValues) {
    const result = reportFormSchema.safeParse({ ...validValues, ...values })

    return result.error?.issues.find((issue) => issue.path[0] === field)?.message
}

describe('reportFormSchema', () => {
    it('reads the parameters as days and a zone', () => {
        expect(reportFormSchema.parse({ ...validValues, zoneId: '2' })).toEqual({
            reportKey: 'revenue',
            from: { year: 2026, month: 9, day: 1 },
            to: { year: 2026, month: 9, day: 30 },
            zoneId: 2,
        })
    })

    it('reads "Sve zone" as no zone', () => {
        expect(reportFormSchema.parse(validValues).zoneId).toBeNull()
    })

    it('accepts a range of one day', () => {
        expect(reportFormSchema.safeParse({ ...validValues, to: '01.09.2026' }).success).toBe(true)
    })

    it.each([
        ['reportKey', '', 'required'],
        ['from', '', 'required'],
        ['from', '1.9.26', 'dateFormat'],
        ['from', '31.09.2026', 'dateInvalid'],
        ['to', '', 'required'],
        ['to', '31.08.2026', 'dateRangeOrder'],
    ] as const)('rejects %s "%s" with %s', (field, value, message) => {
        expect(firstMessage({ [field]: value }, field)).toBe(message)
    })
})

describe('toReportFormValues', () => {
    it('writes the days as DD.MM.GGGG and no zone as ""', () => {
        expect(
            toReportFormValues({
                reportKey: 'revenue',
                from: { year: 2026, month: 9, day: 1 },
                to: { year: 2026, month: 9, day: 30 },
                zoneId: null,
            }),
        ).toEqual(validValues)
    })
})
