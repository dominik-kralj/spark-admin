import { describe, expect, it } from 'vitest'

import { noFilterValues } from './ticketFilterValues'

import {
    ticketFilterFormSchema,
    toTicketFilterFormValues,
    type TicketFilterFormValues,
} from './ticketFilterForm'

const emptyTicketFilterForm = toTicketFilterFormValues(noFilterValues)

function messageFor(values: Partial<TicketFilterFormValues>, field: keyof TicketFilterFormValues) {
    const result = ticketFilterFormSchema.safeParse({ ...emptyTicketFilterForm, ...values })

    return result.error?.issues.find((issue) => issue.path[0] === field)?.message
}

describe('ticketFilterFormSchema', () => {
    it('reads an empty form as no filters', () => {
        expect(ticketFilterFormSchema.parse(emptyTicketFilterForm)).toEqual(noFilterValues)
    })

    it('reads every field, normalising the plate', () => {
        expect(
            ticketFilterFormSchema.parse({
                plate: ' zg 12-ab ',
                from: '01.10.2026',
                to: '6.10.2026.',
                zoneId: '2',
                fiscalStatus: 'failed',
            }),
        ).toEqual({
            plate: 'ZG12AB',
            from: { year: 2026, month: 10, day: 1 },
            to: { year: 2026, month: 10, day: 6 },
            zoneId: 2,
            fiscalStatus: 'failed',
        })
    })

    it('accepts a range of one day', () => {
        expect(messageFor({ from: '06.10.2026', to: '06.10.2026' }, 'to')).toBeUndefined()
    })

    it.each([
        ['from', '2026-10-06', 'dateFormat'],
        ['to', '31.02.2026', 'dateInvalid'],
    ] as const)('rejects %s %j with %s', (field, text, message) => {
        expect(messageFor({ [field]: text }, field)).toBe(message)
    })

    it('rejects a range that ends before it starts, on the end date', () => {
        expect(messageFor({ from: '07.10.2026', to: '06.10.2026' }, 'to')).toBe('dateRangeOrder')
    })
})

describe('toTicketFilterFormValues', () => {
    it('writes the filters back into the fields', () => {
        expect(
            toTicketFilterFormValues({
                plate: 'ZG12',
                from: { year: 2026, month: 10, day: 1 },
                to: null,
                zoneId: 2,
                fiscalStatus: 'done',
            }),
        ).toEqual({
            plate: 'ZG12',
            from: '01.10.2026',
            to: '',
            zoneId: '2',
            fiscalStatus: 'done',
        })
        expect(emptyTicketFilterForm).toEqual({
            plate: '',
            from: '',
            to: '',
            zoneId: '',
            fiscalStatus: '',
        })
    })
})
