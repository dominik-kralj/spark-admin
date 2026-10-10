import { describe, expect, it } from 'vitest'

import { ApiError } from '@/shared/api'

import {
    adminUserResponseSchema,
    toAdminUser,
    toAdminUserCreateRequest,
    toAdminUserFieldErrors,
    toAdminUserUpdateRequest,
} from './adminUser'

const rawAdminUser = {
    adminUserId: 2,
    username: 'marin.loncar',
    name: 'Marin',
    surname: 'Lončar',
}

describe('admin user mapping', () => {
    it('maps a raw admin user to the domain', () => {
        expect(toAdminUser(adminUserResponseSchema.parse(rawAdminUser))).toEqual({
            id: 2,
            username: 'marin.loncar',
            name: 'Marin',
            surname: 'Lončar',
        })
    })

    it('drops a password even if a response carries one', () => {
        const parsed = adminUserResponseSchema.parse({ ...rawAdminUser, password: 'tajna' })

        expect(toAdminUser(parsed)).not.toHaveProperty('password')
    })

    it('sends every field and the password when creating', () => {
        expect(
            toAdminUserCreateRequest({
                username: 'sanja.klaric',
                name: 'Sanja',
                surname: 'Klarić',
                password: ' lozinka ',
            }),
        ).toEqual({
            username: 'sanja.klaric',
            name: 'Sanja',
            surname: 'Klarić',
            password: ' lozinka ',
        })
    })

    it('sends a new password when editing', () => {
        expect(
            toAdminUserUpdateRequest({ name: 'Marin', surname: 'Lončar', password: 'nova' }),
        ).toEqual({ name: 'Marin', surname: 'Lončar', password: 'nova' })
    })

    it('leaves the password out of an edit that keeps it', () => {
        const request = toAdminUserUpdateRequest({
            name: 'Marin',
            surname: 'Lončar',
            password: null,
        })

        expect(request).toEqual({ name: 'Marin', surname: 'Lončar' })
        expect(request).not.toHaveProperty('password')
    })

    it('puts a duplicate username from the server on the username field', () => {
        const error = new ApiError('conflict', {
            status: 409,
            body: { status: 409, code: 'duplicate', field: 'username' },
        })

        expect(toAdminUserFieldErrors(error)).toEqual({ username: 'duplicate' })
    })

    it('maps validation errors to fields in form order', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: { status: 400, errors: { password: ['invalid'], name: ['invalid'] } },
        })

        expect(Object.keys(toAdminUserFieldErrors(error))).toEqual(['name', 'password'])
    })
})
