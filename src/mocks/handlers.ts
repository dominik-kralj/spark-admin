import type { HttpHandler } from 'msw'

import { authHandlers } from './auth'

/** Mock Admin API. Handlers are added per screen, shaped like the spec's tables. */
export const handlers: HttpHandler[] = [...authHandlers]
