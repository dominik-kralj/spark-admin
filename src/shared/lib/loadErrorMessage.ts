import { isApiError } from '@/shared/api'
import { hr } from '@/shared/i18n/hr'

export function loadErrorMessage(error: Error): string {
    if (!isApiError(error)) return hr.listStates.errors.server

    switch (error.kind) {
        case 'network':
            return hr.listStates.errors.network
        case 'forbidden':
            return hr.listStates.errors.forbidden
        default:
            return hr.listStates.errors.server
    }
}
