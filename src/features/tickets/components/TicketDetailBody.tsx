import { SearchX } from 'lucide-react'

import { isApiError } from '@/shared/api'
import { useStrings } from '@/shared/i18n/useStrings'
import { DetailLoading } from '@/shared/ui/DetailLoading'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'

import { useTicket } from '../api/useTickets'

import { TicketDetailContent } from './TicketDetailContent'

export function TicketDetailBody({ ticketId }: { ticketId: string }) {
    const t = useStrings()
    const ticket = useTicket(ticketId)
    const strings = t.tickets.detail

    if (ticket.isPending) return <DetailLoading label={strings.loading} />

    if (ticket.isError && isApiError(ticket.error) && ticket.error.kind === 'notFound') {
        return (
            <EmptyState
                icon={<SearchX />}
                title={strings.notFound.title}
                description={strings.notFound.description}
            />
        )
    }

    if (ticket.isError) {
        return (
            <ErrorState
                title={strings.errorTitle}
                error={ticket.error}
                onRetry={() => void ticket.refetch()}
                isRetrying={ticket.isFetching}
            />
        )
    }

    return <TicketDetailContent ticket={ticket.data} />
}
