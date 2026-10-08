import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'

import type { PrivilegedOwnerField } from '../validators/privilegedOwner'
import { textMaxLength } from '../validators/privilegedOwnerForm'

interface PrivilegedOwnerFieldMessageArgs {
    field: PrivilegedOwnerField
    error: FieldError | undefined
    t: Dictionary
}

// Client rules carry a dictionary key as their message; server errors carry only a type.
export function privilegedOwnerFieldMessage({
    field,
    error,
    t,
}: PrivilegedOwnerFieldMessageArgs): string | undefined {
    if (error === undefined) return undefined
    if (error.type === 'duplicate') return t.forms.serverFieldErrors.duplicate

    const maxLengths: Partial<Record<PrivilegedOwnerField, number>> = textMaxLength
    const maxLength = maxLengths[field]
    if (error.message === 'tooLong' && maxLength !== undefined) {
        return t.privilegedOwners.form.tooLong(maxLength)
    }

    const ruleMessages: Partial<Record<string, string>> = t.forms.validation

    return ruleMessages[error.message ?? ''] ?? t.forms.serverFieldErrors.invalid
}
