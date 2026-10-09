import { describe, expect, it } from 'vitest'

import {
    editInspectorFormSchema,
    emptyInspectorForm,
    newInspectorFormSchema,
    toInspectorFormValues,
    toInspectorInput,
    type InspectorFormValues,
} from './inspectorForm'

const filled: InspectorFormValues = {
    name: ' Marko ',
    surname: 'Horvat ',
    oib: '12345678901',
    pin: '0042',
    isActive: true,
}

function issues(schema: typeof newInspectorFormSchema, values: InspectorFormValues) {
    const result = schema.safeParse(values)

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
        expect(toInspectorInput(newInspectorFormSchema.parse(filled))).toEqual({
            name: 'Marko',
            surname: 'Horvat',
            oib: '12345678901',
            pin: '0042',
            isActive: true,
        })
    })

    it('needs every field, the PIN included, for a new inspector', () => {
        expect(issues(newInspectorFormSchema, emptyInspectorForm)).toEqual({
            name: 'required',
            surname: 'required',
            oib: 'required',
            pin: 'required',
        })
    })

    it('rejects an OIB that is not exactly 11 digits', () => {
        expect(issues(newInspectorFormSchema, { ...filled, oib: '1234567890' })).toEqual({
            oib: 'oibInvalid',
        })
        expect(issues(newInspectorFormSchema, { ...filled, oib: '1234567890a' })).toEqual({
            oib: 'oibInvalid',
        })
    })

    it('rejects a name over 100 characters', () => {
        expect(issues(newInspectorFormSchema, { ...filled, name: 'a'.repeat(101) })).toEqual({
            name: 'tooLong',
        })
    })

    it('lets an edit leave the PIN empty, which keeps the current one', () => {
        const values = editInspectorFormSchema.parse({ ...filled, pin: '' })

        expect(toInspectorInput(values)).not.toHaveProperty('pin')
    })

    it('still checks a PIN typed into an edit', () => {
        expect(issues(editInspectorFormSchema, { ...filled, pin: '12a' })).toEqual({
            pin: 'pinInvalid',
        })
    })

    it('loads an inspector into the form without a PIN', () => {
        expect(
            toInspectorFormValues({
                id: 1,
                name: 'Davor',
                surname: 'Šimić',
                oib: '34567890123',
                isActive: false,
            }),
        ).toEqual({
            name: 'Davor',
            surname: 'Šimić',
            oib: '34567890123',
            pin: '',
            isActive: false,
        })
    })
})
