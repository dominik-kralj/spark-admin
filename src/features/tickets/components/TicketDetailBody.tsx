import { useStrings } from '@/shared/i18n/useStrings'
import { DetailQueryStates } from '@/shared/ui/DetailQueryStates'

import { useTicket } from '../api/useTickets'

import { TicketDetailContent } from './TicketDetailContent'

export function TicketDetailBody({ ticketId }: { ticketId: string }) {
    const t = useStrings()
    const ticket = useTicket(ticketId)

    return (
        <DetailQueryStates query={ticket} strings={t.tickets.detail}>
            {(data) => <TicketDetailContent ticket={data} />}
        </DetailQueryStates>
    )
}
