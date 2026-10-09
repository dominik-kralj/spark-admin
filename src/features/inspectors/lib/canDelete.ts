import type { Inspector } from '../validators/inspector'

/** Tickets keep pointing at the inspector who issued them, so such an inspector is only deactivated. */
export function hasIssuedTickets(inspector: Inspector): boolean {
    return (inspector.ticketCount ?? 0) > 0
}
