import type { CalendarDate } from './calendarDate'

// Part of the format, which stays Croatian in every UI language.
const currency = 'EUR'
const minutesUnit = 'min'
const percentSign = '%'

const dateTimeFormat = new Intl.DateTimeFormat('hr-HR', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
})

const amountFormat = new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'negative',
})

// No grouping: a form input reads it back, and the parser takes one decimal separator only.
const decimalInputFormat = new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
})

const integerFormat = new Intl.NumberFormat('hr-HR', { maximumFractionDigits: 0 })

const rateFormat = new Intl.NumberFormat('hr-HR', { maximumFractionDigits: 2 })

function zagrebParts(value: Date) {
    const parts = dateTimeFormat.formatToParts(value)
    const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value ?? ''

    return {
        date: `${valueOf('day')}.${valueOf('month')}.${valueOf('year')}`,
        time: `${valueOf('hour')}:${valueOf('minute')}`,
    }
}

export function formatDate(value: Date): string {
    return zagrebParts(value).date
}

/** A typed or picked day, with no time zone to convert. */
export function formatCalendarDate({ year, month, day }: CalendarDate): string {
    const pad = (value: number) => String(value).padStart(2, '0')

    return `${pad(day)}.${pad(month)}.${String(year)}`
}

export function formatTime(value: Date): string {
    return zagrebParts(value).time
}

export function formatDateTime(value: Date): string {
    const { date, time } = zagrebParts(value)

    return `${date} ${time}`
}

export function formatAmount(amount: number): string {
    const digits = amountFormat
        .formatToParts(amount)
        .map((part) => (part.type === 'minusSign' ? '-' : part.value))
        .join('')

    return `${digits} ${currency}`
}

export function formatDecimal(amount: number): string {
    return decimalInputFormat.format(amount)
}

export function formatMinutes(minutes: number): string {
    return `${integerFormat.format(minutes)} ${minutesUnit}`
}

/** A number of things, such as tickets: whole, with thousands grouped. */
export function formatCount(count: number): string {
    return integerFormat.format(count)
}

/** A rate such as VAT, given in percent (25 for 25 %). */
export function formatPercent(rate: number): string {
    return `${rateFormat.format(rate)} ${percentSign}`
}
