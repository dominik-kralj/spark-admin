import type { HttpHandler } from 'msw'

import { authHandlers } from './auth'
import { dailyTicketHandlers } from './dailyTickets'
import { inspectorHandlers } from './inspectors'
import { privilegedOwnerHandlers } from './privilegedOwners'
import { ticketHandlers } from './tickets'
import { tenantHandlers } from './tenant'
import { zoneHandlers } from './zones'

/** Mock Admin API. Handlers are added per screen, shaped like the spec's tables. */
export const handlers: HttpHandler[] = [
    ...authHandlers,
    ...tenantHandlers,
    ...ticketHandlers,
    ...dailyTicketHandlers,
    ...zoneHandlers,
    ...privilegedOwnerHandlers,
    ...inspectorHandlers,
]
