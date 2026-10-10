import { createContext } from 'react'

import type { DailyTicket } from '../validators/dailyTicket'

export type FiscalizeTarget = Pick<DailyTicket, 'id' | 'plate'>

export interface FiscalizeRequest {
    ticket: FiscalizeTarget
    trigger: HTMLElement
    /** Where focus goes when the button is gone because the ticket is now fiscalized. */
    fallbackFocus: () => HTMLElement | null
}

export const RequestFiscalizeContext = createContext<((request: FiscalizeRequest) => void) | null>(
    null,
)

/** "Fiskaliziraj ponovno" is offered, and the server accepts it, only after a failed attempt. */
export function canFiscalizeAgain(dailyTicket: Pick<DailyTicket, 'fiscal'>): boolean {
    return dailyTicket.fiscal.status === 'failed'
}
