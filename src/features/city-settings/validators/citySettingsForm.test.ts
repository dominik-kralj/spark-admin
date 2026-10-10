import { describe, expect, it } from 'vitest'

import type { CitySettings } from './citySettings'
import {
    citySettingsFormSchema,
    toCitySettingsFormValues,
    type CitySettingsFormValues,
} from './citySettingsForm'

const settings: CitySettings = {
    name: 'Grad Samobor',
    oib: '12345678903',
    street: 'Trg kralja Tomislava',
    houseNo: '5',
    zipCode: '10430',
    city: 'Samobor',
    iban: 'HR1210010051863000160',
    premisesCode: 'SAMOBOR1',
    cashRegisterCode: '1',
    vatRate: 25,
}

const values: CitySettingsFormValues = toCitySettingsFormValues(settings)

function errorFor(field: keyof CitySettingsFormValues, value: string) {
    const result = citySettingsFormSchema.safeParse({ ...values, [field]: value })

    return result.error?.issues.find((issue) => issue.path[0] === field)?.message
}

describe('citySettingsFormSchema', () => {
    it('round-trips: domain to form values to domain', () => {
        expect(citySettingsFormSchema.parse(values)).toEqual(settings)
    })

    it('shows a fractional VAT rate with a decimal comma', () => {
        expect(toCitySettingsFormValues({ ...settings, vatRate: 13.5 }).vatRate).toBe('13,5')
    })

    it.each([
        ['25', 25],
        ['13,5', 13.5],
        ['5.25', 5.25],
        [' 0 ', 0],
        ['100', 100],
    ])('reads the VAT rate %j as %d', (input, rate) => {
        expect(citySettingsFormSchema.parse({ ...values, vatRate: input }).vatRate).toBe(rate)
    })

    it.each(['100,01', '101', '-5', '2,555', 'abc', '25%'])('rejects the VAT rate %j', (input) => {
        expect(errorFor('vatRate', input)).toBe('vatRateInvalid')
    })

    it('removes spaces from the IBAN and uppercases it', () => {
        const parsed = citySettingsFormSchema.parse({
            ...values,
            iban: 'hr12 1001 0051 8630 0016 0',
        })

        expect(parsed.iban).toBe('HR1210010051863000160')
    })

    it.each(['HR121001005186300016', 'DE1210010051863000160', 'HR12100100518630001601'])(
        'rejects the IBAN %j',
        (input) => {
            expect(errorFor('iban', input)).toBe('ibanInvalid')
        },
    )

    it.each(['0', '01', '1a', '1 2'])('rejects the cash register code %j', (input) => {
        expect(errorFor('cashRegisterCode', input)).toBe('cashRegisterInvalid')
    })

    it('accepts a cash register code of 15 digits but not 16', () => {
        expect(errorFor('cashRegisterCode', '123456789012345')).toBeUndefined()
        expect(errorFor('cashRegisterCode', '1234567890123456')).toBe('tooLong')
    })

    it.each([
        ['name', 100],
        ['street', 150],
        ['houseNo', 20],
        ['zipCode', 10],
        ['city', 100],
        ['premisesCode', 25],
    ] as const)('limits %s to %d characters', (field, maxLength) => {
        expect(errorFor(field, 'a'.repeat(maxLength))).toBeUndefined()
        expect(errorFor(field, 'a'.repeat(maxLength + 1))).toBe('tooLong')
    })

    it.each(Object.keys(values) as (keyof CitySettingsFormValues)[])('requires %s', (field) => {
        expect(errorFor(field, '  ')).toBe('required')
    })

    it('rejects an OIB that is not 11 digits', () => {
        expect(errorFor('oib', '1234567890')).toBe('oibInvalid')
    })
})
