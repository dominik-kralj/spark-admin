// @vitest-environment node
import { describe, expect, it } from 'vitest'

import type { TicketFilterValues } from './ticketFilterForm'

import {
    activeDrawerFilterCount,
    noFilterValues,
    readFilterValues,
    toFilterSearchParams,
    toTicketFilters,
} from './ticketFilterValues'

const allSet: TicketFilterValues = {
    plate: 'ZG12',
    from: { year: 2026, month: 10, day: 1 },
    to: { year: 2026, month: 10, day: 6 },
    zoneId: 2,
    fiscalStatus: 'failed',
}

describe('readFilterValues', () => {
    it('reads every filter from the URL', () => {
        const params = new URLSearchParams(
            'plate=ZG12&from=2026-10-01&to=2026-10-06&zone=2&fiscal=failed',
        )

        expect(readFilterValues(params)).toEqual(allSet)
    })

    it('reads an empty URL as no filters', () => {
        expect(readFilterValues(new URLSearchParams())).toEqual(noFilterValues)
    })

    it('ignores values it cannot read', () => {
        const params = new URLSearchParams('from=06.10.2026&to=2026-02-30&zone=abc&fiscal=DONE')

        expect(readFilterValues(params)).toEqual(noFilterValues)
    })

    it('normalises a plate typed into the URL', () => {
        expect(readFilterValues(new URLSearchParams('plate=zg 12-a')).plate).toBe('ZG12A')
    })
})

describe('toFilterSearchParams', () => {
    it('writes every filter, and reads back the same values', () => {
        const updates = toFilterSearchParams(allSet)

        expect(updates).toEqual({
            plate: 'ZG12',
            from: '2026-10-01',
            to: '2026-10-06',
            zone: '2',
            fiscal: 'failed',
        })
        expect(readFilterValues(new URLSearchParams(updates as Record<string, string>))).toEqual(
            allSet,
        )
    })

    it('removes the params of filters that are not set', () => {
        expect(toFilterSearchParams(noFilterValues)).toEqual({
            plate: null,
            from: null,
            to: null,
            zone: null,
            fiscal: null,
        })
    })
})

describe('toTicketFilters', () => {
    it('turns the days into Zagreb instants: from midnight, to the next midnight', () => {
        expect(toTicketFilters(allSet)).toEqual({
            plate: 'ZG12',
            createdFrom: new Date('2026-09-30T22:00:00Z'),
            createdTo: new Date('2026-10-06T22:00:00Z'),
            zoneId: 2,
            fiscalStatus: 'failed',
        })
    })

    it('leaves out the filters that are not set', () => {
        expect(toTicketFilters(noFilterValues)).toEqual({})
    })
})

describe('activeDrawerFilterCount', () => {
    it('counts the date range once, and not the plate', () => {
        expect(activeDrawerFilterCount(allSet)).toBe(3)
        expect(activeDrawerFilterCount({ ...noFilterValues, plate: 'ZG1' })).toBe(0)
        expect(activeDrawerFilterCount({ ...noFilterValues, to: allSet.to })).toBe(1)
    })
})
