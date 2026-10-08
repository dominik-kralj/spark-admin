import { z } from 'zod'

import { formatDecimal } from '@/shared/lib/format'

import type { Zone, ZoneInput } from './zone'

// Messages are dictionary keys, so the form shows them in the active language at render.
export type ZoneFormMessage =
    | 'required'
    | 'tooLong'
    | 'notAmount'
    | 'tooManyDecimals'
    | 'tooLarge'
    | 'notWholeNumber'
    | 'notPositive'

const message = (key: ZoneFormMessage) => ({ message: key })

const maxTextLength = 20
const maxAmount = 99_999_999.99
const maxInteger = 2_147_483_647

function toNumber(value: string): number {
    return Number(value.replace(',', '.'))
}

const textField = z
    .string()
    .trim()
    .min(1, message('required'))
    .max(maxTextLength, message('tooLong'))

const amountField = z
    .string()
    .trim()
    .min(1, message('required'))
    .regex(/^\d+([.,]\d+)?$/, message('notAmount'))
    .refine((value) => !/[.,]\d{3}/.test(value), message('tooManyDecimals'))
    .refine((value) => toNumber(value) <= maxAmount, message('tooLarge'))

const wholeNumberField = z
    .string()
    .trim()
    .min(1, message('required'))
    .regex(/^\d+$/, message('notWholeNumber'))
    .refine((value) => Number(value) <= maxInteger, message('tooLarge'))

export const zoneFormSchema = z.object({
    code: textField,
    name: textField,
    price: amountField,
    dailyTicketPrice: amountField,
    durationMinutes: wholeNumberField.refine((value) => Number(value) > 0, message('notPositive')),
    maxExtensions: wholeNumberField,
    dpkIssueDelayMinutes: wholeNumberField,
})

export type ZoneFormValues = z.input<typeof zoneFormSchema>

export type ValidZoneFormValues = z.output<typeof zoneFormSchema>

export const emptyZoneForm: ZoneFormValues = {
    code: '',
    name: '',
    price: '',
    dailyTicketPrice: '',
    durationMinutes: '',
    maxExtensions: '',
    dpkIssueDelayMinutes: '',
}

export function toZoneInput(values: ValidZoneFormValues): ZoneInput {
    return {
        code: values.code,
        name: values.name,
        price: toNumber(values.price),
        dailyTicketPrice: toNumber(values.dailyTicketPrice),
        durationMinutes: Number(values.durationMinutes),
        maxExtensions: Number(values.maxExtensions),
        dpkIssueDelayMinutes: Number(values.dpkIssueDelayMinutes),
    }
}

export function toZoneFormValues(zone: Zone): ZoneFormValues {
    return {
        code: zone.code,
        name: zone.name,
        price: formatDecimal(zone.price),
        dailyTicketPrice: formatDecimal(zone.dailyTicketPrice),
        durationMinutes: String(zone.durationMinutes),
        maxExtensions: String(zone.maxExtensions),
        dpkIssueDelayMinutes: String(zone.dpkIssueDelayMinutes),
    }
}
