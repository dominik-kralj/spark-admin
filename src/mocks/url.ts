import { config } from '@/shared/config'

export function apiUrl(path: string): string {
    return `${config.apiBaseUrl}/api/v1/admin${path}`
}
