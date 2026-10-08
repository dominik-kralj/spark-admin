import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import {
    privilegedOwnerResponseSchema,
    toPrivilegedOwner,
    toPrivilegedOwnerFieldErrors,
    toPrivilegedOwnerRequest,
    type PrivilegedOwner,
    type PrivilegedOwnerInput,
} from './privilegedOwner'

const rawOwner = {
    privilegedOwnerId: 7,
    vehicleRegistration: 'ZG1234AB',
    validUntil: '2026-12-31T22:59:59.999Z',
    ownerName: 'Josip Babić',
    address: 'Perkovčeva ulica',
    houseNo: '12',
    zipCode: '10430',
    city: 'Samobor',
}

const ownerInput: PrivilegedOwnerInput = {
    plate: 'ZG1234AB',
    validUntil: new Date('2026-12-31T22:59:59.999Z'),
    ownerName: 'Josip Babić',
    address: { street: 'Perkovčeva ulica', houseNo: '12', zipCode: '10430', city: 'Samobor' },
}

const owner: PrivilegedOwner = { id: 7, ...ownerInput }

describe('privileged owner mapping', () => {
    it('maps a raw entry to the domain, with the address grouped and the date as an instant', () => {
        expect(toPrivilegedOwner(privilegedOwnerResponseSchema.parse(rawOwner))).toEqual(owner)
    })

    it('maps a domain entry back to the request body, with ValidUntil in UTC', () => {
        expect(toPrivilegedOwnerRequest(ownerInput)).toEqual({
            vehicleRegistration: 'ZG1234AB',
            validUntil: '2026-12-31T22:59:59.999Z',
            ownerName: 'Josip Babić',
            address: 'Perkovčeva ulica',
            houseNo: '12',
            zipCode: '10430',
            city: 'Samobor',
        })
    })

    it('round-trips: domain to request to response to domain', () => {
        const response = privilegedOwnerResponseSchema.parse({
            privilegedOwnerId: 7,
            ...toPrivilegedOwnerRequest(ownerInput),
        })

        expect(toPrivilegedOwner(response)).toEqual(owner)
    })

    it('reads a ValidUntil sent with an offset as the same instant', () => {
        const response = privilegedOwnerResponseSchema.parse({
            ...rawOwner,
            validUntil: '2026-12-31T23:59:59.999+01:00',
        })

        expect(toPrivilegedOwner(response).validUntil).toEqual(ownerInput.validUntil)
    })

    it.each([
        ['without a time zone', '2026-12-31T23:59:59'],
        ['that is not a date', 'soon'],
    ])('rejects a ValidUntil %s', (_case, validUntil) => {
        expect(privilegedOwnerResponseSchema.safeParse({ ...rawOwner, validUntil }).success).toBe(
            false,
        )
    })
})

describe('toPrivilegedOwnerFieldErrors', () => {
    it('maps 400 field errors to form fields and drops unknown keys', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: {
                errors: {
                    vehicleRegistration: ['x'],
                    validUntil: ['x'],
                    address: ['x'],
                    zipCode: ['x'],
                    tenantId: ['x'],
                },
            },
        })

        expect(toPrivilegedOwnerFieldErrors(error)).toEqual({
            plate: 'invalid',
            validUntil: 'invalid',
            street: 'invalid',
            zipCode: 'invalid',
        })
    })

    it('returns no field errors for a server error', () => {
        expect(toPrivilegedOwnerFieldErrors(new ApiError('server', { status: 500 }))).toEqual({})
    })
})
