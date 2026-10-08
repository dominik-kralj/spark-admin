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

/** How far Zagreb's wall clock is ahead of UTC at `instant`, in milliseconds. */
function zagrebOffset(instant: number): number {
    const parts = zagrebClock.formatToParts(instant)
    const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((part) => part.type === type)?.value)
    const wallClock = Date.UTC(
        valueOf('year'),
        valueOf('month') - 1,
        valueOf('day'),
        valueOf('hour'),
        valueOf('minute'),
        valueOf('second'),
    )

    return wallClock - Math.floor(instant / 1000) * 1000
}

/** 23:59:59.999 on that day in Zagreb, as an instant. Clocks change at night, never near midnight. */
export function endOfZagrebDay({ year, month, day }: CalendarDate): Date {
    const asIfUtc = Date.UTC(year, month - 1, day, 23, 59, 59, 999)

    return new Date(asIfUtc - zagrebOffset(asIfUtc))
}
