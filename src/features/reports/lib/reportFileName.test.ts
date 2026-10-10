// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { reportFileName } from './reportFileName'

describe('reportFileName', () => {
    it('names the PDF after the report and its days', () => {
        expect(
            reportFileName({
                reportKey: 'revenue',
                from: { year: 2026, month: 9, day: 1 },
                to: { year: 2026, month: 9, day: 30 },
                zoneId: null,
            }),
        ).toBe('izvjestaj-revenue-2026-09-01-2026-09-30.pdf')
    })
})
