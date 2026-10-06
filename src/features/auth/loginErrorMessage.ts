import { isApiError } from '@/api'
import { hr } from '@/shared/i18n/hr'

export function loginErrorMessage(error: Error): string {
    if (!isApiError(error)) return hr.login.errors.server

    switch (error.kind) {
        case 'unauthorized':
            return hr.login.errors.unauthorized
        case 'rateLimited':
            return hr.login.errors.rateLimited
        case 'network':
            return hr.login.errors.network
        default:
            return hr.login.errors.server
    }
}
