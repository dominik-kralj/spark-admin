export type ApiErrorKind =
    | 'network'
    | 'validation'
    | 'unauthorized'
    | 'forbidden'
    | 'notFound'
    | 'conflict'
    | 'rateLimited'
    | 'server'
    | 'invalidResponse'

/**
 * Every failed API call rejects with this, except aborts, which pass through
 * so TanStack Query can tell a cancelled query from a failed one. The UI picks
 * its message by `kind`; server text is never shown. The message never holds
 * request headers, so the token and API key cannot leak into logs.
 */
export class ApiError extends Error {
    override readonly name = 'ApiError'
    readonly kind: ApiErrorKind
    /** HTTP status, absent for network failures. */
    readonly status: number | undefined

    constructor(kind: ApiErrorKind, status?: number, options?: ErrorOptions) {
        super(status === undefined ? kind : `${kind} (HTTP ${status})`, options)
        this.kind = kind
        this.status = status
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}

/** See the status table in docs/api-assumptions.md. */
export function kindForStatus(status: number): ApiErrorKind {
    switch (status) {
        case 400:
        case 422:
            return 'validation'
        case 401:
            return 'unauthorized'
        case 403:
            return 'forbidden'
        case 404:
            return 'notFound'
        case 409:
            return 'conflict'
        case 429:
            return 'rateLimited'
        default:
            return 'server'
    }
}
