// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { formatAmount, formatDate, formatDateTime, formatTime } from './format'

describe('test time zone', () => {
    it('is not Zagreb, so the helpers are proven to ignore it', () => {
        expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Los_Angeles')
    })
})

describe('formatDate', () => {
    it('zero-pads day and month', () => {
        expect(formatDate(new Date('2026-03-05T08:04:00Z'))).toBe('05.03.2026')
    })

    it('uses the Zagreb date when UTC is still on the previous day', () => {
        expect(formatDate(new Date('2026-10-06T22:30:00Z'))).toBe('07.10.2026')
    })

    it('moves to the new year in Zagreb before UTC does', () => {
        expect(formatDate(new Date('2026-12-31T23:15:00Z'))).toBe('01.01.2027')
    })
})

describe('formatTime', () => {
    it('zero-pads hours and minutes', () => {
        expect(formatTime(new Date('2026-03-05T08:04:00Z'))).toBe('09:04')
    })

    it('shows midnight as 00:00', () => {
        expect(formatTime(new Date('2026-01-14T23:00:00Z'))).toBe('00:00')
    })

    it('uses 24-hour time', () => {
        expect(formatTime(new Date('2026-01-14T17:45:00Z'))).toBe('18:45')
    })

    it('jumps from 01:59 to 03:00 when summer time starts', () => {
        expect(formatTime(new Date('2026-03-29T00:59:00Z'))).toBe('01:59')
        expect(formatTime(new Date('2026-03-29T01:00:00Z'))).toBe('03:00')
    })

    it('shows 02:30 twice when summer time ends', () => {
        expect(formatTime(new Date('2026-10-25T00:30:00Z'))).toBe('02:30')
        expect(formatTime(new Date('2026-10-25T01:30:00Z'))).toBe('02:30')
    })
})

describe('formatDateTime', () => {
    it('joins the Zagreb date and time with a space', () => {
        expect(formatDateTime(new Date('2026-10-06T22:30:00Z'))).toBe('07.10.2026 00:30')
    })

    it('shows the first minute of the new year in Zagreb', () => {
        expect(formatDateTime(new Date('2026-12-31T23:00:00Z'))).toBe('01.01.2027 00:00')
    })
})

describe('formatAmount', () => {
    it('shows two decimals after a comma and the EUR code', () => {
        expect(formatAmount(0.7)).toBe('0,70 EUR')
        expect(formatAmount(15)).toBe('15,00 EUR')
    })

    it('groups thousands with a dot', () => {
        expect(formatAmount(1234.5)).toBe('1.234,50 EUR')
        expect(formatAmount(1234567.89)).toBe('1.234.567,89 EUR')
    })

    it('rounds to the nearest cent, halves away from zero', () => {
        expect(formatAmount(0.704)).toBe('0,70 EUR')
        expect(formatAmount(0.706)).toBe('0,71 EUR')
        expect(formatAmount(1.125)).toBe('1,13 EUR')
        expect(formatAmount(1.005)).toBe('1,01 EUR')
        expect(formatAmount(2.675)).toBe('2,68 EUR')
        expect(formatAmount(999.999)).toBe('1.000,00 EUR')
    })

    it('uses an ASCII minus for negative amounts', () => {
        expect(formatAmount(-1234.5)).toBe('-1.234,50 EUR')
    })

    it('drops the minus when the amount rounds to zero', () => {
        expect(formatAmount(-0.001)).toBe('0,00 EUR')
    })
})
