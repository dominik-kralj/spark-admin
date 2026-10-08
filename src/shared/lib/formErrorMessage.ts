import { isApiError } from '@/shared/api'
import type { Dictionary } from '@/shared/i18n/dictionary'

export function formErrorMessage(error: Error, t: Dictionary): string {
    if (!isApiError(error)) return t.forms.errors.server

    const messages: Partial<Record<string, string>> = t.forms.errors

    return messages[error.kind] ?? t.forms.errors.server
}
