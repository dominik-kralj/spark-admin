import { isApiError } from '@/shared/api'
import type { Dictionary } from '@/shared/i18n/dictionary'

export function loginErrorMessage(error: Error, t: Dictionary): string {
    if (!isApiError(error)) return t.login.errors.server

    switch (error.kind) {
        case 'unauthorized':
            return t.login.errors.unauthorized
        case 'rateLimited':
            return t.login.errors.rateLimited
        case 'network':
            return t.login.errors.network
        default:
            return t.login.errors.server
    }
}
