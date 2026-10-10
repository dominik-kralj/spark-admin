// @vitest-environment node
import { describe, expect, it } from 'vitest'

import { formatReportValue } from './formatReportValue'

describe('formatReportValue', () => {
    it.each([
        [1234.5, 'amount', '1.234,50 EUR'],
        [1234, 'count', '1.234'],
        ['ZONA1', 'text', 'ZONA1'],
        [7, 'text', '7'],
        ['2026-09-05', 'date', '05.09.2026'],
        ['rujan 2026', 'date', 'rujan 2026'],
        ['ukupno', 'amount', 'ukupno'],
        [null, 'amount', ''],
    ] as const)('shows %s in a %s column as "%s"', (value, type, shown) => {
        expect(formatReportValue(value, type)).toBe(shown)
    })
})
