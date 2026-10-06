import { config } from '@/shared/config'

/** The mock's view of an Admin API path, e.g. apiUrl('/login'). */
export function apiUrl(path: string): string {
    return `${config.apiBaseUrl}/api/v1/admin${path}`
}
