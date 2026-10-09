import { describe, expect, it } from 'vitest'

import {
    emptyInspectorForm,
    inspectorFormSchema,
    toInspectorFormValues,
    type InspectorFormValues,
} from './inspectorForm'

const filled: InspectorFormValues = {
    name: ' Marko ',
    surname: 'Horvat ',
    oib: '12345678901',
    pin: '0042',
    isActive: true,
}

function issues(values: InspectorFormValues) {
    const result = inspectorFormSchema.safeParse(values)

    return result.success
        ? {}
        : Object.fromEntries(
              result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
          )
}

describe('inspector form', () => {
    it('starts empty and active', () => {
        expect(emptyInspectorForm).toEqual({
            name: '',
            surname: '',
            oib: '',
            pin: '',
            isActive: true,
        })
    })

    it('trims names and keeps the PIN with its leading zeros', () => {
        expect(inspectorFormSchema.parse(filled)).toEqual({
            name: 'Marko',
            surname: 'Horvat',
            oib: '12345678901',
            pin: '0042',
            isActive: true,
        })
    })

    it('needs every field, the PIN included', () => {
        expect(issues(emptyInspectorForm)).toEqual({
            name: 'required',
            surname: 'required',
            oib: 'required',
            pin: 'required',
        })
    })

    it('rejects an OIB that is not exactly 11 digits', () => {
        expect(issues({ ...filled, oib: '1234567890' })).toEqual({ oib: 'oibInvalid' })
        expect(issues({ ...filled, oib: '1234567890a' })).toEqual({ oib: 'oibInvalid' })
    })

    it('rejects a PIN that is not digits only', () => {
        expect(issues({ ...filled, pin: '12a' })).toEqual({ pin: 'pinInvalid' })
    })

    it('rejects a name over 100 characters', () => {
        expect(issues({ ...filled, name: 'a'.repeat(101) })).toEqual({ name: 'tooLong' })
    })

    it('loads an inspector into the form with its PIN', () => {
        expect(
            toInspectorFormValues({
                id: 3,
                name: 'Davor',
                surname: 'Šimić',
                oib: '34567890123',
                isActive: false,
                ticketCount: 7,
                pin: '1111',
            }),
        ).toEqual({
            name: 'Davor',
            surname: 'Šimić',
            oib: '34567890123',
            pin: '1111',
            isActive: false,
        })
    })
})
