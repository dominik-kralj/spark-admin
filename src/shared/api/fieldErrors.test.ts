import { describe, expect, it } from 'vitest'

import { ApiError } from './errors'
import { fieldErrorsFrom } from './fieldErrors'

const zoneFields = { zoneCode: 'code', price: 'price' } as const

describe('fieldErrorsFrom', () => {
    it('maps the keys of a 400 errors object to form fields as invalid', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: { status: 400, errors: { price: ['invalid'], zoneCode: ['too long'] } },
        })

        expect(fieldErrorsFrom(error, zoneFields)).toEqual({ code: 'invalid', price: 'invalid' })
    })

    it('lists the fields in form order, whatever the order of the body', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: { errors: { price: ['invalid'], zoneCode: ['invalid'] } },
        })

        expect(Object.keys(fieldErrorsFrom(error, zoneFields))).toEqual(['code', 'price'])
    })

    it('ignores keys the form does not know', () => {
        const error = new ApiError('validation', {
            status: 400,
            body: { errors: { tenantId: ['invalid'], price: ['invalid'] } },
        })

        expect(fieldErrorsFrom(error, zoneFields)).toEqual({ price: 'invalid' })
    })

    it('maps a 409 duplicate to its field', () => {
        const error = new ApiError('conflict', {
            status: 409,
            body: { status: 409, code: 'duplicate', field: 'zoneCode' },
        })

        expect(fieldErrorsFrom(error, zoneFields)).toEqual({ code: 'duplicate' })
    })

    it('gives no field errors for a conflict that is not a duplicate', () => {
        const error = new ApiError('conflict', {
            status: 409,
            body: { status: 409, code: 'zoneInUse' },
        })

        expect(fieldErrorsFrom(error, zoneFields)).toEqual({})
    })

    it('gives no field errors for another error or body', () => {
        expect(fieldErrorsFrom(new ApiError('server', { status: 500 }), zoneFields)).toEqual({})
        expect(
            fieldErrorsFrom(new ApiError('validation', { status: 400, body: 'Bad' }), zoneFields),
        ).toEqual({})
        expect(fieldErrorsFrom(new Error('boom'), zoneFields)).toEqual({})
    })
})
