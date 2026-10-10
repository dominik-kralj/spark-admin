import type { CalendarDate } from '@/shared/lib/calendarDate'

/** The whole calendar month before `today`, the range a monthly report covers. */
export function lastFullMonth({ year, month }: CalendarDate) {
    const isJanuary = month === 1
    const from = { year: isJanuary ? year - 1 : year, month: isJanuary ? 12 : month - 1, day: 1 }
    // Day 0 of this month is the last day of the one before.
    const lastDay = new Date(Date.UTC(year, month - 1, 0)).getUTCDate()

    return { from, to: { ...from, day: lastDay } }
}
