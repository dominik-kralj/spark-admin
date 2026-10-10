// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { lastFullMonth } from './lastFullMonth'

describe('lastFullMonth', () => {
    it('is the whole month before today', () => {
        expect(lastFullMonth({ year: 2026, month: 10, day: 10 })).toEqual({
            from: { year: 2026, month: 9, day: 1 },
            to: { year: 2026, month: 9, day: 30 },
        })
    })

    it('reaches back into the previous year in January', () => {
        expect(lastFullMonth({ year: 2027, month: 1, day: 31 })).toEqual({
            from: { year: 2026, month: 12, day: 1 },
            to: { year: 2026, month: 12, day: 31 },
        })
    })

    it('ends February on the leap day', () => {
        expect(lastFullMonth({ year: 2028, month: 3, day: 1 }).to).toEqual({
            year: 2028,
            month: 2,
            day: 29,
        })
    })
})
