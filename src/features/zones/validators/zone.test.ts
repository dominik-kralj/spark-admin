import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import {
    toZone,
    toZoneFieldErrors,
    toZoneRequest,
    zoneResponseSchema,
    type Zone,
    type ZoneInput,
} from './zone'

const rawZone = {
    zoneId: 3,
    zoneCode: '708001',
    zoneName: 'Centar',
    price: 0.7,
    dailyTicketPrice: 20,
    durationMinutes: 60,
    maxExtensions: 3,
    dpkIssueDelayMinutes: 15,
}

const zoneInput: ZoneInput = {
    code: '708001',
    name: 'Centar',
    price: 0.7,
    dailyTicketPrice: 20,
    durationMinutes: 60,
    maxExtensions: 3,
    dpkIssueDelayMinutes: 15,
}

const zone: Zone = { id: 3, ...zoneInput }

describe('zone mapping', () => {
    it('maps a raw zone to the domain, keeping prices as numbers', () => {
        expect(toZone(zoneResponseSchema.parse(rawZone))).toEqual(zone)
    })

    it('maps a domain zone back to the request body without its id', () => {
        expect(toZoneRequest(zoneInput)).toEqual({
            zoneCode: '708001',
            zoneName: 'Centar',
            price: 0.7,
            dailyTicketPrice: 20,
            durationMinutes: 60,
            maxExtensions: 3,
            dpkIssueDelayMinutes: 15,
        })
    })

    it('round-trips: domain to request to response to domain', () => {
        const response = zoneResponseSchema.parse({ zoneId: 3, ...toZoneRequest(zoneInput) })

        expect(toZone(response)).toEqual(zone)
    })

    it('rejects a response with a price sent as a string', () => {
        expect(zoneResponseSchema.safeParse({ ...rawZone, price: '0.70' }).success).toBe(false)
    })
})

describe('toZoneFieldErrors', () => {
    it('maps a 409 duplicate on zoneCode to the code field', () => {
        const error = new ApiError('conflict', {
            status: 409,
            body: { status: 409, code: 'duplicate', field: 'zoneCode' },
        })

        expect(toZoneFieldErrors(error)).toEqual([{ field: 'code', reason: 'duplicate' }])
    })

    it('maps a 409 duplicate on zoneName to the name field', () => {
        const error = new ApiError('conflict', {
            status: 409,
            body: { code: 'duplicate', field: 'zoneName' },
        })

        expect(toZoneFieldErrors(error)).toEqual([{ field: 'name', reason: 'duplicate' }])
    })

    it('maps 400 field errors to domain names and drops unknown keys', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: {
                status: 400,
                errors: { durationMinutes: ['mustBePositive'], price: ['x'], tenantId: ['x'] },
            },
        })

        expect(toZoneFieldErrors(error)).toEqual([
            { field: 'durationMinutes', reason: 'invalid' },
            { field: 'price', reason: 'invalid' },
        ])
    })

    it.each([
        ['a 409 without a field', new ApiError('conflict', { status: 409, body: {} })],
        [
            'a 409 on an unknown field',
            new ApiError('conflict', { status: 409, body: { code: 'duplicate', field: 'x' } }),
        ],
        ['a 400 without a body', new ApiError('validation', { status: 400 })],
        ['a server error', new ApiError('server', { status: 500, body: { errors: {} } })],
        ['a plain error', new Error('boom')],
    ])('returns no field errors for %s', (_case, error) => {
        expect(toZoneFieldErrors(error)).toEqual([])
    })
})
