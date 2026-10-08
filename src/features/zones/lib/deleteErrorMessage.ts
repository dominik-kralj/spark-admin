import { isApiError } from '@/shared/api'
import type { Dictionary } from '@/shared/i18n/dictionary'

export function deleteErrorMessage(error: Error, t: Dictionary): string {
    if (!isApiError(error)) return t.zones.delete.errors.server

    const messages: Partial<Record<string, string>> = t.zones.delete.errors

    return messages[error.kind] ?? t.zones.delete.errors.server
}
