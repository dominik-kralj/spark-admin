import { isApiError } from '@/shared/api'
import type { Dictionary } from '@/shared/i18n/dictionary'

export function listErrorMessage(error: Error, t: Dictionary): string {
    if (!isApiError(error)) return t.listStates.errors.server

    switch (error.kind) {
        case 'network':
            return t.listStates.errors.network
        case 'forbidden':
            return t.listStates.errors.forbidden
        default:
            return t.listStates.errors.server
    }
}
