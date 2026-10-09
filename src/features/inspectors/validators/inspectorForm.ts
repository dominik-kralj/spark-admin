import { z } from 'zod'

import { oibField, optionalPinField, pinField, requiredText } from '@/shared/lib/validation'

import type { Inspector, InspectorInput } from './inspector'

export const nameMaxLength = 100

const inspectorFields = {
    name: requiredText(nameMaxLength),
    surname: requiredText(nameMaxLength),
    oib: oibField,
    isActive: z.boolean(),
}

export const newInspectorFormSchema = z.object({ ...inspectorFields, pin: pinField })

/** Empty keeps the inspector's current PIN, which the form never sees. */
export const editInspectorFormSchema = z.object({ ...inspectorFields, pin: optionalPinField })

export type InspectorFormValues = z.input<typeof newInspectorFormSchema>

export type ValidInspectorFormValues = z.output<typeof newInspectorFormSchema>

export const emptyInspectorForm: InspectorFormValues = {
    name: '',
    surname: '',
    oib: '',
    pin: '',
    isActive: true,
}

export function toInspectorInput({ pin, ...values }: ValidInspectorFormValues): InspectorInput {
    return pin === '' ? values : { ...values, pin }
}

export function toInspectorFormValues(inspector: Inspector): InspectorFormValues {
    return {
        name: inspector.name,
        surname: inspector.surname,
        oib: inspector.oib,
        pin: '',
        isActive: inspector.isActive,
    }
}
