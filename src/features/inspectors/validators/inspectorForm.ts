import { z } from 'zod'

import { oibField, pinField, requiredText } from '@/shared/lib/validation'

import type { InspectorDetail } from './inspector'

export const nameMaxLength = 100

export const inspectorFormSchema = z.object({
    name: requiredText(nameMaxLength),
    surname: requiredText(nameMaxLength),
    oib: oibField,
    pin: pinField,
    isActive: z.boolean(),
})

export type InspectorFormValues = z.input<typeof inspectorFormSchema>

export type ValidInspectorFormValues = z.output<typeof inspectorFormSchema>

export const emptyInspectorForm: InspectorFormValues = {
    name: '',
    surname: '',
    oib: '',
    pin: '',
    isActive: true,
}

export function toInspectorFormValues(inspector: InspectorDetail): InspectorFormValues {
    return {
        name: inspector.name,
        surname: inspector.surname,
        oib: inspector.oib,
        pin: inspector.pin,
        isActive: inspector.isActive,
    }
}
