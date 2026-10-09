import { z } from 'zod'

import { fieldErrorsFrom, type ServerFieldError } from '@/shared/api'

// The PIN is write-only: a response never carries it.
export const inspectorResponseSchema = z.object({
    inspectorId: z.number(),
    name: z.string(),
    surname: z.string(),
    oib: z.string(),
    isActive: z.boolean(),
})

export const inspectorListResponseSchema = z.array(inspectorResponseSchema)

type InspectorResponse = z.output<typeof inspectorResponseSchema>

type InspectorRequest = Omit<InspectorResponse, 'inspectorId'> & NewPin

export interface Inspector {
    id: number
    name: string
    surname: string
    oib: string
    isActive: boolean
}

/** Without a `pin`, an update keeps the inspector's current PIN. */
interface NewPin {
    pin?: string
}

export type InspectorInput = Omit<Inspector, 'id'> & NewPin

export type InspectorField = keyof Required<InspectorInput>

export function toInspector(raw: InspectorResponse): Inspector {
    return {
        id: raw.inspectorId,
        name: raw.name,
        surname: raw.surname,
        oib: raw.oib,
        isActive: raw.isActive,
    }
}

export function toInspectorRequest(input: InspectorInput): InspectorRequest {
    return {
        name: input.name,
        surname: input.surname,
        oib: input.oib,
        isActive: input.isActive,
        ...(input.pin !== undefined && { pin: input.pin }),
    }
}

// In form order, so the first error is the first field on screen.
const inspectorFieldForRawName: Record<keyof InspectorRequest, InspectorField> = {
    name: 'name',
    surname: 'surname',
    oib: 'oib',
    pin: 'pin',
    isActive: 'isActive',
}

export function toInspectorFieldErrors(
    error: unknown,
): Partial<Record<InspectorField, ServerFieldError>> {
    return fieldErrorsFrom(error, inspectorFieldForRawName)
}
