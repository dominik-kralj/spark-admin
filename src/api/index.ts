/**
 * The public API module. Code outside src/api/ and src/mocks/ imports only
 * from here (enforced by ESLint); `request` and raw field names stay inside.
 */
export { ApiError, isApiError, type ApiErrorKind } from './errors'
export { setAccessToken } from './session'
