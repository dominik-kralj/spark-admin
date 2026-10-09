import { SearchX } from 'lucide-react'
import type { RefObject } from 'react'

import { isApiError } from '@/shared/api'
import { useStrings } from '@/shared/i18n/useStrings'
import { DetailLoading } from '@/shared/ui/DetailLoading'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'

import { useDailyTicket } from '../api/useDailyTickets'

import { DailyTicketDetailContent } from './DailyTicketDetailContent'

interface DailyTicketDetailBodyProps {
    ticketId: string
    titleRef: RefObject<HTMLHeadingElement | null>
}

export function DailyTicketDetailBody({ ticketId, titleRef }: DailyTicketDetailBodyProps) {
    const t = useStrings()
    const dailyTicket = useDailyTicket(ticketId)
    const strings = t.dailyTickets.detail

    if (dailyTicket.isPending) return <DetailLoading label={strings.loading} />

    if (
        dailyTicket.isError &&
        isApiError(dailyTicket.error) &&
        dailyTicket.error.kind === 'notFound'
    ) {
        return (
            <EmptyState
                icon={<SearchX />}
                title={strings.notFound.title}
                description={strings.notFound.description}
            />
        )
    }

    if (dailyTicket.isError) {
        return (
            <ErrorState
                title={strings.errorTitle}
                error={dailyTicket.error}
                onRetry={() => void dailyTicket.refetch()}
                isRetrying={dailyTicket.isFetching}
            />
        )
    }

    return <DailyTicketDetailContent dailyTicket={dailyTicket.data} titleRef={titleRef} />
}
