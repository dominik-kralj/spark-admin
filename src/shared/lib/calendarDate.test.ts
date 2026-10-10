// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
    compareCalendarDates,
    endOfZagrebDay,
    nextDay,
    readIsoDate,
    startOfZagrebDay,
    toIsoDate,
    zagrebCalendarDate,
} from './calendarDate'
import { formatDate } from './format'

describe('endOfZagrebDay', () => {
    it.each([
        ['winter time', { year: 2026, month: 12, day: 31 }, '2026-12-31T22:59:59.999Z'],
        ['summer time', { year: 2027, month: 6, day: 30 }, '2027-06-30T21:59:59.999Z'],
        [
            'the day clocks go forward',
            { year: 2027, month: 3, day: 28 },
            '2027-03-28T21:59:59.999Z',
        ],
        ['the day clocks go back', { year: 2026, month: 10, day: 25 }, '2026-10-25T22:59:59.999Z'],
        ['a leap day', { year: 2028, month: 2, day: 29 }, '2028-02-29T22:59:59.999Z'],
    ])('is the last millisecond of the day in Zagreb, in %s', (_case, date, instant) => {
        expect(endOfZagrebDay(date).toISOString()).toBe(instant)
    })

    it('shows as the same date it was made from, without shifting a day', () => {
        expect(formatDate(endOfZagrebDay({ year: 2026, month: 12, day: 31 }))).toBe('31.12.2026')
        expect(formatDate(endOfZagrebDay({ year: 2027, month: 1, day: 1 }))).toBe('01.01.2027')
    })
})

describe('startOfZagrebDay', () => {
    it.each([
        ['winter time', { year: 2026, month: 12, day: 31 }, '2026-12-30T23:00:00.000Z'],
        ['summer time', { year: 2026, month: 10, day: 6 }, '2026-10-05T22:00:00.000Z'],
        ['the day clocks go back', { year: 2026, month: 10, day: 25 }, '2026-10-24T22:00:00.000Z'],
        [
            'the day after clocks go back',
            { year: 2026, month: 10, day: 26 },
            '2026-10-25T23:00:00.000Z',
        ],
    ])('is midnight in Zagreb, in %s', (_case, date, instant) => {
        expect(startOfZagrebDay(date).toISOString()).toBe(instant)
    })
})

describe('nextDay', () => {
    it.each([
        [
            { year: 2026, month: 10, day: 6 },
            { year: 2026, month: 10, day: 7 },
        ],
        [
            { year: 2026, month: 10, day: 31 },
            { year: 2026, month: 11, day: 1 },
        ],
        [
            { year: 2026, month: 12, day: 31 },
            { year: 2027, month: 1, day: 1 },
        ],
        [
            { year: 2028, month: 2, day: 28 },
            { year: 2028, month: 2, day: 29 },
        ],
    ])('follows %o with %o', (date, next) => {
        expect(nextDay(date)).toEqual(next)
    })
})

describe('compareCalendarDates', () => {
    it('orders by year, then month, then day', () => {
        const day = { year: 2026, month: 10, day: 6 }

        expect(compareCalendarDates(day, { ...day })).toBe(0)
        expect(compareCalendarDates(day, { year: 2026, month: 10, day: 7 })).toBeLessThan(0)
        expect(compareCalendarDates(day, { year: 2026, month: 9, day: 30 })).toBeGreaterThan(0)
        expect(compareCalendarDates(day, { year: 2027, month: 1, day: 1 })).toBeLessThan(0)
    })
})

describe('ISO dates', () => {
    it('writes a day as YYYY-MM-DD and reads it back', () => {
        const day = { year: 2026, month: 3, day: 7 }

        expect(toIsoDate(day)).toBe('2026-03-07')
        expect(readIsoDate('2026-03-07')).toEqual(day)
    })

    it.each(['', '2026-3-7', '2026-02-30', '07.03.2026', 'abc'])('reads %j as no date', (text) => {
        expect(readIsoDate(text)).toBeNull()
    })
})

describe('zagrebCalendarDate', () => {
    it('is the day on the wall clock in Zagreb', () => {
        expect(zagrebCalendarDate(new Date('2026-10-10T12:00:00Z'))).toEqual({
            year: 2026,
            month: 10,
            day: 10,
        })
    })

    it('is already the next day in Zagreb when UTC is not', () => {
        expect(zagrebCalendarDate(new Date('2026-12-31T23:30:00Z'))).toEqual({
            year: 2027,
            month: 1,
            day: 1,
        })
    })
})
