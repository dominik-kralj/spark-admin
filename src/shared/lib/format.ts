import { hr } from '@/shared/i18n/hr'

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

const amountSymbols: Partial<Record<Intl.NumberFormatPartTypes, string>> = {
    minusSign: '-',
    group: '.',
    decimal: ',',
}

function zagrebParts(value: Date) {
    const parts = dateTimeFormat.formatToParts(value)
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((item) => item.type === type)?.value ?? ''

    return {
        date: `${part('day')}.${part('month')}.${part('year')}`,
        time: `${part('hour')}:${part('minute')}`,
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
    const number = amountFormat
        .formatToParts(amount)
        .map((part) => amountSymbols[part.type] ?? part.value)
        .join('')

    return `${number} ${hr.format.currency}`
}
