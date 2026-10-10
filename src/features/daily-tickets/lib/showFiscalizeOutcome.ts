import type { Dictionary } from '@/shared/i18n/dictionary'
import { toaster } from '@/shared/lib/toaster'

import type { DailyTicketDetail } from '../validators/dailyTicket'

/** The toast for what the tax authority answered; a queued attempt is still in progress. */
export function showFiscalizeOutcome(
    { plate, fiscal }: DailyTicketDetail,
    strings: Dictionary['dailyTickets']['fiscalize'],
): void {
    switch (fiscal.status) {
        case 'done':
            toaster.success({ title: strings.done(plate) })
            return
        case 'failed':
            toaster.error({
                title: strings.failedAgain(plate),
                description: strings.failedAgainDescription,
            })
            return
        default:
            toaster.info({ title: strings.started(plate) })
    }
}
