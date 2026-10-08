import { z } from 'zod'

import { isRealDate, type CalendarDate } from './calendarDate'

export type ValidationMessage =
    | 'required'
    | 'tooLong'
    | 'plateInvalid'
    | 'oibInvalid'
    | 'pinInvalid'
    | 'dateFormat'
    | 'dateInvalid'

/** A Zod error message that is a dictionary key, so the form translates it at render. */
export const messageKey = <TKey extends string>(key: TKey) => ({ message: key })

const message = messageKey<ValidationMessage>

export function requiredText(maxLength: number) {
    return z.string().trim().min(1, message('required')).max(maxLength, message('tooLong'))
}

// Whitespace of any kind, the hyphen-minus and the Unicode dashes a paste can bring.
const plateSeparators = /[\s\p{Pd}]/gu

export function normalisePlate(value: string): string {
    return value.replace(plateSeparators, '').toLocaleUpperCase('hr')
}

// Croatian plates have no Q, W, X or Y.
const plateLetter = '[A-PR-VZČĆĐŠŽ]'

/** A normalised Croatian plate: city code, three or four digits, one or two letters (ZG1234AB). */
export const platePattern = new RegExp(`^${plateLetter}{2}\\d{3,4}${plateLetter}{1,2}$`, 'u')

export const plateField = z
    .string()
    .transform(normalisePlate)
    .pipe(
        z
            .string()
            .min(1, message('required'))
            .refine((plate) => plate === '' || platePattern.test(plate), message('plateInvalid')),
    )

// Digits only, no checksum: whether to check ISO 7064 is open (open-questions.md #1).
export const oibField = z
    .string()
    .trim()
    .min(1, message('required'))
    .regex(/^(\d{11})?$/, message('oibInvalid'))

const pinMaxLength = 4

export function filterPin(value: string): string {
    return value.replace(/\D/g, '').slice(0, pinMaxLength)
}

export const pinField = z
    .string()
    .min(1, message('required'))
    .regex(/^\d{0,4}$/, message('pinInvalid'))

// DD.MM.GGGG; the trailing dot of the Croatian spelling (31.12.2026.) is allowed.
const datePattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/

type DateText = { date: CalendarDate } | { error: 'required' | 'dateFormat' | 'dateInvalid' }

/** Reads DD.MM.GGGG, ignoring spaces a paste can bring (31. 12. 2026.). */
export function readDateText(value: string): DateText {
    const compact = value.replace(/\s/g, '')
    const match = datePattern.exec(compact)

    if (compact === '') return { error: 'required' }
    if (match === null) return { error: 'dateFormat' }

    const date = { year: Number(match[3]), month: Number(match[2]), day: Number(match[1]) }

    return isRealDate(date) ? { date } : { error: 'dateInvalid' }
}

export const dateField = z.string().transform((value, context): CalendarDate => {
    const result = readDateText(value)
    if ('date' in result) return result.date

    context.addIssue({ code: 'custom', ...message(result.error) })

    return z.NEVER
})
