// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { endOfZagrebDay } from './calendarDate'
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
