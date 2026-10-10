import { readIsoDate } from '@/shared/lib/calendarDate'
import { formatAmount, formatCalendarDate, formatCount } from '@/shared/lib/format'

import type { ReportColumnType, ReportValue } from '../validators/report'

export function formatReportValue(value: ReportValue, type: ReportColumnType): string {
    if (value === null) return ''
    if (typeof value === 'string') return type === 'date' ? formatDay(value) : value

    switch (type) {
        case 'amount':
            return formatAmount(value)
        case 'count':
            return formatCount(value)
        case 'text':
        case 'date':
            return String(value)
    }
}

/** A YYYY-MM-DD day as DD.MM.GGGG; anything else as sent. */
function formatDay(value: string): string {
    const date = readIsoDate(value)

    return date === null ? value : formatCalendarDate(date)
}
