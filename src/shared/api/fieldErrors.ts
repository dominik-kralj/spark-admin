import { z } from 'zod'

import { isApiError } from './errors'

export type ServerFieldError = 'invalid' | 'duplicate'

const validationBodySchema = z.object({ errors: z.record(z.string(), z.unknown()) })
const duplicateBodySchema = z.object({ code: z.literal('duplicate'), field: z.string() })

/** The request properties the server named, mapped to form fields. See docs/api-assumptions.md. */
function rawFieldErrors(error: unknown): Record<string, ServerFieldError> {
    if (!isApiError(error)) return {}

    const validation = validationBodySchema.safeParse(error.body)
    if (error.kind === 'validation' && validation.success) {
        return Object.fromEntries(
            Object.keys(validation.data.errors).map((key) => [key, 'invalid' as const]),
        )
    }

    const duplicate = duplicateBodySchema.safeParse(error.body)
    if (error.kind === 'conflict' && duplicate.success) {
        return { [duplicate.data.field]: 'duplicate' }
    }

    return {}
}

/**
 * `formFields` maps raw request property names, from a feature's validators, to form fields,
 * in form order: the result keeps that order, so its first entry is the first field on screen.
 */
export function fieldErrorsFrom<TField extends string>(
    error: unknown,
    formFields: Readonly<Record<string, TField>>,
): Partial<Record<TField, ServerFieldError>> {
    const raw = rawFieldErrors(error)
    const fieldErrors: Partial<Record<TField, ServerFieldError>> = {}

    for (const [rawField, formField] of Object.entries(formFields)) {
        const fieldError = raw[rawField]
        if (fieldError !== undefined) fieldErrors[formField] = fieldError
    }

    return fieldErrors
}
