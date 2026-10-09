import { z } from 'zod'

import { compareCalendarDates } from '@/shared/lib/calendarDate'
import { formatCalendarDate } from '@/shared/lib/format'
import { processingStatuses } from '@/shared/lib/processingStatus'
import { messageKey, normalisePlate, optionalDateField } from '@/shared/lib/validation'

import type { TicketFilterValues } from '../lib/ticketFilterValues'

export const ticketFilterFormSchema = z
    .object({
        plate: z.string().transform(normalisePlate),
        from: optionalDateField,
        to: optionalDateField,
        zoneId: z.string().transform((value) => (value === '' ? null : Number(value))),
        fiscalStatus: z
            .enum(['', ...processingStatuses])
            .transform((value) => (value === '' ? null : value)),
    })
    .refine(({ from, to }) => from === null || to === null || compareCalendarDates(from, to) <= 0, {
        path: ['to'],
        ...messageKey('dateRangeOrder'),
    }) satisfies z.ZodType<TicketFilterValues>

export type TicketFilterFormValues = z.input<typeof ticketFilterFormSchema>

export const emptyTicketFilterForm: TicketFilterFormValues = {
    plate: '',
    from: '',
    to: '',
    zoneId: '',
    fiscalStatus: '',
}

export function toTicketFilterFormValues(values: TicketFilterValues): TicketFilterFormValues {
    return {
        plate: values.plate,
        from: values.from === null ? '' : formatCalendarDate(values.from),
        to: values.to === null ? '' : formatCalendarDate(values.to),
        zoneId: values.zoneId === null ? '' : String(values.zoneId),
        fiscalStatus: values.fiscalStatus ?? '',
    }
}
