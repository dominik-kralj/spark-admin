/** A day on the calendar, with no time or time zone: what a person types into a date field. */
export interface CalendarDate {
    year: number
    month: number
    day: number
}

function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function daysInMonth(year: number, month: number): number {
    const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    return days[month - 1] ?? 0
}

export function isRealDate({ year, month, day }: CalendarDate): boolean {
    return year >= 1 && day >= 1 && day <= daysInMonth(year, month)
}

export function nextDay({ year, month, day }: CalendarDate): CalendarDate {
    if (day < daysInMonth(year, month)) return { year, month, day: day + 1 }
    if (month < 12) return { year, month: month + 1, day: 1 }

    return { year: year + 1, month: 1, day: 1 }
}

/** Negative when `a` comes first, 0 for the same day, positive when `a` comes later. */
export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
    return a.year - b.year || a.month - b.month || a.day - b.day
}

const pad = (part: number, length: number) => String(part).padStart(length, '0')

/** YYYY-MM-DD, as a URL or a date library writes a day. */
export function toIsoDate({ year, month, day }: CalendarDate): string {
    return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`
}

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/

export function readIsoDate(text: string): CalendarDate | null {
    const match = isoDatePattern.exec(text)
    if (match === null) return null

    const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }

    return isRealDate(date) ? date : null
}

const zagrebClock = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zagreb',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
})

function zagrebClockParts(instant: number) {
    const parts = zagrebClock.formatToParts(instant)
    const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((part) => part.type === type)?.value)

    return {
        year: valueOf('year'),
        month: valueOf('month'),
        day: valueOf('day'),
        hour: valueOf('hour'),
        minute: valueOf('minute'),
        second: valueOf('second'),
    }
}

/** The day it is in Zagreb at `instant`. */
export function zagrebCalendarDate(instant: Date): CalendarDate {
    const { year, month, day } = zagrebClockParts(instant.getTime())

    return { year, month, day }
}

/** How far Zagreb's wall clock is ahead of UTC at `instant`, in milliseconds. */
function zagrebOffset(instant: number): number {
    const { year, month, day, hour, minute, second } = zagrebClockParts(instant)
    const wallClock = Date.UTC(year, month - 1, day, hour, minute, second)

    return wallClock - Math.floor(instant / 1000) * 1000
}

function zagrebWallClock(asIfUtc: number): Date {
    return new Date(asIfUtc - zagrebOffset(asIfUtc))
}

/** 00:00 on that day in Zagreb, as an instant. */
export function startOfZagrebDay({ year, month, day }: CalendarDate): Date {
    return zagrebWallClock(Date.UTC(year, month - 1, day))
}

/** 23:59:59.999 on that day in Zagreb, as an instant. Clocks change at night, never near midnight. */
export function endOfZagrebDay({ year, month, day }: CalendarDate): Date {
    return zagrebWallClock(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
}

/** The whole calendar month before `today`, the range a monthly report covers. */
export function lastFullMonth({ year, month }: CalendarDate) {
    const isJanuary = month === 1
    const from = { year: isJanuary ? year - 1 : year, month: isJanuary ? 12 : month - 1, day: 1 }
    // Day 0 of this month is the last day of the one before.
    const lastDay = new Date(Date.UTC(year, month - 1, 0)).getUTCDate()

    return { from, to: { ...from, day: lastDay } }
}
