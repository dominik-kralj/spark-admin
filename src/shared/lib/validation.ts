import { z } from 'zod'

import { isRealDate, type CalendarDate } from './calendarDate'

/** Messages are dictionary keys (`forms.validation`), so a form shows them in the active language. */
export type ValidationMessage =
    | 'required'
    | 'plateInvalid'
    | 'plateTooLong'
    | 'oibInvalid'
    | 'pinInvalid'
    | 'dateFormat'
    | 'dateInvalid'

const message = (key: ValidationMessage) => ({ message: key })

const plateMaxLength = 20

// Whitespace of any kind, the hyphen-minus and the Unicode dashes a paste can bring.
const plateSeparators = /[\s\p{Pd}]/gu

/** Removes spaces and dashes and upper-cases, as drivers' plates are stored (ZG1234AB). */
export function normalisePlate(value: string): string {
    return value.replace(plateSeparators, '').toLocaleUpperCase('hr')
}

export const plateField = z
    .string()
    .transform(normalisePlate)
    .pipe(
        z
            .string()
            .min(1, message('required'))
            .max(plateMaxLength, message('plateTooLong'))
            .regex(/^[\p{L}\d]*$/u, message('plateInvalid')),
    )

// Digits only, no checksum: whether to check ISO 7064 is open (open-questions.md #1).
export const oibField = z
    .string()
    .trim()
    .min(1, message('required'))
    .regex(/^(\d{11})?$/, message('oibInvalid'))

const pinMaxLength = 4

/** Drops everything but digits while the PIN is typed, and stops at four. */
export function filterPin(value: string): string {
    return value.replace(/\D/g, '').slice(0, pinMaxLength)
}

export const pinField = z
    .string()
    .min(1, message('required'))
    .regex(/^\d{0,4}$/, message('pinInvalid'))

// DD.MM.GGGG; the trailing dot of the Croatian spelling (31.12.2026.) is allowed.
const datePattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/

/** Reads a typed DD.MM.GGGG date, ignoring spaces a paste can bring (31. 12. 2026.). */
export const dateField = z.string().transform((value, context): CalendarDate => {
    const compact = value.replace(/\s/g, '')
    const match = datePattern.exec(compact)
    const issue = (key: ValidationMessage) => {
        context.addIssue({ code: 'custom', ...message(key) })

        return z.NEVER
    }

    if (compact === '') return issue('required')
    if (match === null) return issue('dateFormat')

    const date = { year: Number(match[3]), month: Number(match[2]), day: Number(match[1]) }

    return isRealDate(date) ? date : issue('dateInvalid')
})
