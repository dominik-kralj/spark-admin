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

/** The message holds only kind and status, so the token and key never reach a log. */
export class ApiError extends Error {
    override readonly name = 'ApiError'
    readonly kind: ApiErrorKind
    readonly status: number | undefined
    /** The parsed JSON error body, for a feature's validators to read; undefined when not JSON. */
    readonly body: unknown

    constructor(
        kind: ApiErrorKind,
        { status, cause, body }: { status?: number; cause?: unknown; body?: unknown } = {},
    ) {
        super(status === undefined ? kind : `${kind} (HTTP ${status})`, { cause })
        this.kind = kind
        this.status = status
        this.body = body
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
