import { describe, expect, it } from 'vitest'

import type { Zone } from './zone'
import { toZoneFormValues, toZoneInput, zoneFormSchema, type ZoneFormValues } from './zoneForm'

const validValues: ZoneFormValues = {
    code: 'ZONA3',
    name: 'Treća zona',
    price: '0,70',
    dailyTicketPrice: '15',
    durationMinutes: '60',
    maxExtensions: '2',
    dpkIssueDelayMinutes: '15',
}

function firstMessage(values: Partial<ZoneFormValues>, field: keyof ZoneFormValues) {
    const result = zoneFormSchema.safeParse({ ...validValues, ...values })

    return result.error?.issues.find((issue) => issue.path[0] === field)?.message
}

describe('zoneFormSchema', () => {
    it('accepts a complete zone', () => {
        expect(zoneFormSchema.safeParse(validValues).success).toBe(true)
    })

    it.each([
        ['code', '', 'required'],
        ['code', '   ', 'required'],
        ['code', 'A'.repeat(21), 'tooLong'],
        ['name', '', 'required'],
        ['name', 'N'.repeat(21), 'tooLong'],
        ['price', '', 'required'],
        ['price', 'abc', 'notAmount'],
        ['price', '-1', 'notAmount'],
        ['price', '1.000,00', 'notAmount'],
        ['price', '1,005', 'tooManyDecimals'],
        ['price', '100000000', 'tooLarge'],
        ['dailyTicketPrice', '15,', 'notAmount'],
        ['durationMinutes', '', 'required'],
        ['durationMinutes', '1,5', 'notWholeNumber'],
        ['durationMinutes', '0', 'notPositive'],
        ['maxExtensions', '-1', 'notWholeNumber'],
        ['maxExtensions', '2147483648', 'tooLarge'],
        ['dpkIssueDelayMinutes', '15 min', 'notWholeNumber'],
    ] as const)('rejects %s "%s" with %s', (field, value, message) => {
        expect(firstMessage({ [field]: value }, field)).toBe(message)
    })

    it.each([
        ['price', '0'],
        ['price', ' 0.70 '],
        ['price', '99999999,99'],
        ['code', 'A'.repeat(20)],
        ['code', '  ZONA1  '],
        ['maxExtensions', '0'],
        ['dpkIssueDelayMinutes', '0'],
    ] as const)('accepts %s "%s"', (field, value) => {
        expect(firstMessage({ [field]: value }, field)).toBeUndefined()
    })
})

describe('toZoneInput', () => {
    it('reads a decimal comma or point, and trims text', () => {
        const values = zoneFormSchema.parse({
            ...validValues,
            code: ' ZONA3 ',
            price: '0,70',
            dailyTicketPrice: '0.70',
        })

        expect(toZoneInput(values)).toEqual({
            code: 'ZONA3',
            name: 'Treća zona',
            price: 0.7,
            dailyTicketPrice: 0.7,
            durationMinutes: 60,
            maxExtensions: 2,
            dpkIssueDelayMinutes: 15,
        })
    })
})

describe('toZoneFormValues', () => {
    it('fills the form with the stored values, amounts with a decimal comma', () => {
        const zone: Zone = {
            id: 1,
            code: 'ZONA1',
            name: 'Prva zona',
            price: 0.7,
            dailyTicketPrice: 15,
            durationMinutes: 60,
            maxExtensions: 2,
            dpkIssueDelayMinutes: 15,
        }

        expect(toZoneFormValues(zone)).toEqual({
            code: 'ZONA1',
            name: 'Prva zona',
            price: '0,70',
            dailyTicketPrice: '15,00',
            durationMinutes: '60',
            maxExtensions: '2',
            dpkIssueDelayMinutes: '15',
        })
    })

    it('reads back to the same zone', () => {
        const zone: Zone = {
            id: 2,
            code: '2A',
            name: 'Druga zona A',
            price: 1234567.89,
            dailyTicketPrice: 0.05,
            durationMinutes: 45,
            maxExtensions: 0,
            dpkIssueDelayMinutes: 0,
        }
        const { id, ...input } = zone

        expect(id).toBe(2)
        expect(toZoneInput(zoneFormSchema.parse(toZoneFormValues(zone)))).toEqual(input)
    })
})
