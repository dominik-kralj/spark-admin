import { isApiError } from '@/shared/api'
import type { Dictionary } from '@/shared/i18n/dictionary'

/** The message for a save error that no field error explains. */
export function formErrorMessage(error: Error, t: Dictionary): string {
    if (!isApiError(error)) return t.forms.errors.server

    switch (error.kind) {
        case 'network':
            return t.forms.errors.network
        case 'validation':
            return t.forms.errors.validation
        case 'forbidden':
            return t.forms.errors.forbidden
        case 'notFound':
            return t.forms.errors.notFound
        case 'conflict':
            return t.forms.errors.conflict
        default:
            return t.forms.errors.server
    }
}
