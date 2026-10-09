// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { utcDateTimeSchema } from './utcDateTime'

describe('utcDateTimeSchema', () => {
    it('reads an instant with Z as given', () => {
        expect(utcDateTimeSchema.parse('2026-10-06T07:14:00Z')).toEqual(
            new Date(Date.UTC(2026, 9, 6, 7, 14)),
        )
    })

    it('reads an instant with an offset as given', () => {
        expect(utcDateTimeSchema.parse('2026-10-06T09:14:00+02:00')).toEqual(
            new Date(Date.UTC(2026, 9, 6, 7, 14)),
        )
    })

    it('reads a date-time without an offset as UTC, not local time', () => {
        expect(utcDateTimeSchema.parse('2026-10-06T07:14:00.123')).toEqual(
            new Date(Date.UTC(2026, 9, 6, 7, 14, 0, 123)),
        )
    })

    it.each(['2026-10-06', '06.10.2026 09:14', '', 'yesterday'])('rejects %j', (value) => {
        expect(utcDateTimeSchema.safeParse(value).success).toBe(false)
    })
})
