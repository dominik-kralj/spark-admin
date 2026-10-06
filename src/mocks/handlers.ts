import type { HttpHandler } from 'msw'

/** Mock Admin API. Handlers are added per screen, shaped like the spec's tables. */
export const handlers: HttpHandler[] = []
