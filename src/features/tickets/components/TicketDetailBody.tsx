import { Skeleton, Stack } from '@chakra-ui/react'
import { SearchX } from 'lucide-react'

import { isApiError } from '@/shared/api'
import { useStrings } from '@/shared/i18n/useStrings'
import { useAnnouncement } from '@/shared/lib/useAnnouncement'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'

import type { useTicket } from '../api/useTickets'

import { TicketDetailContent } from './TicketDetailContent'

function DetailLoading({ label }: { label: string }) {
    useAnnouncement(label)

    return (
        <Stack gap="4" aria-hidden="true">
            <Skeleton h="16" borderRadius="md" />
            <Skeleton h="4" w="40%" />
            <Skeleton h="24" />
            <Skeleton h="24" />
        </Stack>
    )
}

/** The detail's loading, not-found and error states, then the ticket. */
export function TicketDetailBody({ ticket }: { ticket: ReturnType<typeof useTicket> }) {
    const t = useStrings()
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
