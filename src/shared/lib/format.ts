// Part of the format, which stays Croatian in every UI language.
const currency = 'EUR'
const minutesUnit = 'min'

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
