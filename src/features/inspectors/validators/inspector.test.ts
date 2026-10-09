import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import {
    inspectorDetailResponseSchema,
    inspectorResponseSchema,
    toInspector,
    toInspectorDetail,
    toInspectorFieldErrors,
    toInspectorRequest,
    type Inspector,
    type InspectorInput,
} from './inspector'

const rawInspector = {
    inspectorId: 4,
    name: 'Marko',
    surname: 'Horvat',
    oib: '12345678901',
    isActive: true,
}

const inspectorFields = {
    name: 'Marko',
    surname: 'Horvat',
    oib: '12345678901',
    isActive: true,
}

const inspector: Inspector = { id: 4, ...inspectorFields, ticketCount: null }

const inspectorInput: InspectorInput = { ...inspectorFields, pin: '1234' }

describe('inspector mapping', () => {
    it('carries the number of tickets the inspector issued', () => {
        expect(
            toInspector(inspectorResponseSchema.parse({ ...rawInspector, ticketCount: 42 })),
        ).toEqual({ ...inspector, ticketCount: 42 })
    })

    it('maps a raw inspector to the domain', () => {
        expect(toInspector(inspectorResponseSchema.parse(rawInspector))).toEqual(inspector)
    })

    it('keeps a PIN out of a list entry even if the response carries one', () => {
        const parsed = inspectorResponseSchema.parse({ ...rawInspector, pin: '1234' })

        expect(toInspector(parsed)).not.toHaveProperty('pin')
    })

    it('maps a raw inspector detail to the domain with its PIN, leading zeros kept', () => {
        const parsed = inspectorDetailResponseSchema.parse({ ...rawInspector, pin: '0042' })

        expect(toInspectorDetail(parsed)).toEqual({ ...inspector, pin: '0042' })
    })

    it('rejects a detail without a PIN', () => {
        expect(inspectorDetailResponseSchema.safeParse(rawInspector).success).toBe(false)
    })

    it('maps a domain inspector to the request body, with its PIN', () => {
        expect(toInspectorRequest(inspectorInput)).toEqual({
            name: 'Marko',
            surname: 'Horvat',
            oib: '12345678901',
            isActive: true,
            pin: '1234',
        })
    })

    it('round-trips: domain to request to detail response to domain', () => {
        const request = toInspectorRequest(inspectorInput)
        const response = inspectorDetailResponseSchema.parse({ inspectorId: 4, ...request })

        expect(toInspectorDetail(response)).toEqual({ ...inspector, pin: '1234' })
    })

    it('rejects a response with isActive sent as a number', () => {
        expect(inspectorResponseSchema.safeParse({ ...rawInspector, isActive: 1 }).success).toBe(
            false,
        )
    })
})

describe('toInspectorFieldErrors', () => {
    it('maps a 409 duplicate on oib to the OIB field', () => {
        const error = new ApiError('conflict', {
            status: 409,
            body: { status: 409, code: 'duplicate', field: 'oib' },
        })

        expect(toInspectorFieldErrors(error)).toEqual({ oib: 'duplicate' })
    })

    it('maps 400 field errors to form fields in form order and drops unknown keys', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: { status: 400, errors: { pin: ['x'], name: ['x'], tenantId: ['x'] } },
        })

        expect(Object.entries(toInspectorFieldErrors(error))).toEqual([
            ['name', 'invalid'],
            ['pin', 'invalid'],
        ])
    })

    it('returns no field errors for a server error', () => {
        expect(toInspectorFieldErrors(new ApiError('server', { status: 500 }))).toEqual({})
    })
})
