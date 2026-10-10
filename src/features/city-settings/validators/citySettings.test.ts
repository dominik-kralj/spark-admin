import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import {
    citySettingsResponseSchema,
    toCitySettings,
    toCitySettingsFieldErrors,
    toCitySettingsRequest,
    type CitySettings,
} from './citySettings'

const rawTenant = {
    tenantName: 'Grad Samobor',
    vatID: '12345678903',
    address: 'Trg kralja Tomislava',
    houseNo: '5',
    zipCode: '10430',
    city: 'Samobor',
    iban: 'HR1210010051863000160',
    premisesCode: 'SAMOBOR1',
    cashRegisterCode: '1',
    stopaPDV: 25,
    reportEmail: 'promet@samobor.hr',
}

const citySettings: CitySettings = {
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

describe('city settings mapping', () => {
    it('maps the raw tenant to the domain', () => {
        expect(toCitySettings(citySettingsResponseSchema.parse(rawTenant))).toEqual(citySettings)
    })

    it('accepts a tenant without a report e-mail, which this screen does not show', () => {
        const parsed = citySettingsResponseSchema.parse({ ...rawTenant, reportEmail: null })

        expect(toCitySettings(parsed)).toEqual(citySettings)
    })

    it('keeps a fractional VAT rate', () => {
        const parsed = citySettingsResponseSchema.parse({ ...rawTenant, stopaPDV: 13.5 })

        expect(toCitySettings(parsed).vatRate).toBe(13.5)
    })

    it('rejects a VAT rate sent as text', () => {
        expect(citySettingsResponseSchema.safeParse({ ...rawTenant, stopaPDV: '25' }).success).toBe(
            false,
        )
    })

    it('maps the domain to the request body, without the read-only report e-mail', () => {
        const request = toCitySettingsRequest(citySettings)

        expect(request).not.toHaveProperty('reportEmail')
        expect({ ...request, reportEmail: rawTenant.reportEmail }).toEqual(rawTenant)
    })

    it('round-trips: domain to request to response to domain', () => {
        const response = citySettingsResponseSchema.parse({
            ...toCitySettingsRequest(citySettings),
            reportEmail: null,
        })

        expect(toCitySettings(response)).toEqual(citySettings)
    })
})

describe('toCitySettingsFieldErrors', () => {
    it('maps 400 field errors to form fields in form order and drops unknown keys', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: {
                status: 400,
                errors: { stopaPDV: ['x'], cashRegisterCode: ['x'], vatID: ['x'], $: ['x'] },
            },
        })

        expect(Object.entries(toCitySettingsFieldErrors(error))).toEqual([
            ['oib', 'invalid'],
            ['cashRegisterCode', 'invalid'],
            ['vatRate', 'invalid'],
        ])
    })

    it('returns no field errors for a server error', () => {
        expect(toCitySettingsFieldErrors(new ApiError('server', { status: 500 }))).toEqual({})
    })
})
