import { isApiError, type ApiErrorKind } from '@/shared/api'

type ErrorMessages = { server: string } & Partial<Record<ApiErrorKind, string>>

/** The message for the error's kind, or `server` for any other kind or error. */
export function errorMessage(error: Error, messages: ErrorMessages): string {
    if (!isApiError(error)) return messages.server

    return messages[error.kind] ?? messages.server
}
