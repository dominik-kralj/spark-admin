import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'

import type { ZoneField } from '../validators/zone'

interface ZoneFieldMessageArgs {
    field: ZoneField
    error: FieldError | undefined
    t: Dictionary
}

// Client rules carry a dictionary key as their message; server errors carry only a type.
export function zoneFieldMessage({ field, error, t }: ZoneFieldMessageArgs): string | undefined {
    if (error === undefined) return undefined

    const duplicateMessages: Partial<Record<ZoneField, string>> = t.zones.form.duplicate
    if (error.type === 'duplicate') {
        return duplicateMessages[field] ?? t.forms.serverFieldErrors.duplicate
    }

    const ruleMessages: Partial<Record<string, string>> = t.zones.form.errors

    return ruleMessages[error.message ?? ''] ?? t.forms.serverFieldErrors.invalid
}
