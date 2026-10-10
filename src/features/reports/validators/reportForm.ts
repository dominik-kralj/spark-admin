import type { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { compareCalendarDates } from '@/shared/lib/calendarDate'
import { formatCalendarDate } from '@/shared/lib/format'
import { dateField, messageKey } from '@/shared/lib/validation'

export const reportFormSchema = z
    .object({
        reportKey: z.string().min(1, messageKey('required')),
        from: dateField,
        to: dateField,
        zoneId: z.string().transform((value) => (value === '' ? null : Number(value))),
    })
    .refine(({ from, to }) => compareCalendarDates(from, to) <= 0, {
        path: ['to'],
        ...messageKey('dateRangeOrder'),
    })

export type ReportFormValues = z.input<typeof reportFormSchema>

/** What a report is made for: whole days, both included, and one zone or all (null). */
export type ReportParams = z.output<typeof reportFormSchema>

export type ReportForm = UseFormReturn<ReportFormValues, unknown, ReportParams>

export function toReportFormValues(params: ReportParams): ReportFormValues {
    return {
        reportKey: params.reportKey,
        from: formatCalendarDate(params.from),
        to: formatCalendarDate(params.to),
        zoneId: params.zoneId === null ? '' : String(params.zoneId),
    }
}
