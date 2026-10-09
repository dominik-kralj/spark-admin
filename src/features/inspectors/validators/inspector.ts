import { z } from 'zod'

import { fieldErrorsFrom, type ServerFieldError } from '@/shared/api'

// A list entry has no PIN; only one inspector's detail carries it.
export const inspectorResponseSchema = z.object({
    inspectorId: z.number(),
    name: z.string(),
    surname: z.string(),
    oib: z.string(),
    isActive: z.boolean(),
})

export const inspectorListResponseSchema = z.array(inspectorResponseSchema)

export const inspectorDetailResponseSchema = inspectorResponseSchema.extend({ pin: z.string() })

type InspectorResponse = z.output<typeof inspectorResponseSchema>

type InspectorDetailResponse = z.output<typeof inspectorDetailResponseSchema>

type InspectorRequest = Omit<InspectorDetailResponse, 'inspectorId'>

export interface Inspector {
    id: number
    name: string
    surname: string
    oib: string
    isActive: boolean
}

export interface InspectorDetail extends Inspector {
    pin: string
}

export type InspectorInput = Omit<InspectorDetail, 'id'>

export type InspectorField = keyof InspectorInput

export function toInspector(raw: InspectorResponse): Inspector {
    return {
        id: raw.inspectorId,
        name: raw.name,
        surname: raw.surname,
        oib: raw.oib,
        isActive: raw.isActive,
    }
}

export function toInspectorDetail(raw: InspectorDetailResponse): InspectorDetail {
    return { ...toInspector(raw), pin: raw.pin }
}

export function toInspectorRequest(input: InspectorInput): InspectorRequest {
    return {
        name: input.name,
        surname: input.surname,
        oib: input.oib,
        pin: input.pin,
        isActive: input.isActive,
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
