import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'

interface FieldMessageArgs {
    error: FieldError | undefined
    /** The form's rule messages, by the dictionary key its schema reports. */
    ruleMessages: Partial<Record<string, string>>
    /** For a server "duplicate"; the generic one when left out. */
    duplicateMessage?: string | undefined
    t: Dictionary
}

// Client rules carry a dictionary key as their message; server errors carry only a type.
export function fieldMessage({
    error,
    ruleMessages,
    duplicateMessage,
    t,
}: FieldMessageArgs): string | undefined {
    if (error === undefined) return undefined
    if (error.type === 'duplicate') return duplicateMessage ?? t.forms.serverFieldErrors.duplicate

    return ruleMessages[error.message ?? ''] ?? t.forms.serverFieldErrors.invalid
}
