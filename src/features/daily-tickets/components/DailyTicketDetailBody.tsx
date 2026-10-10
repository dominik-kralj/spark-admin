import type { RefObject } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { DetailQueryStates } from '@/shared/ui/DetailQueryStates'

import { useDailyTicket } from '../api/useDailyTickets'

import { DailyTicketDetailContent } from './DailyTicketDetailContent'

interface DailyTicketDetailBodyProps {
    ticketId: string
    titleRef: RefObject<HTMLHeadingElement | null>
}

export function DailyTicketDetailBody({ ticketId, titleRef }: DailyTicketDetailBodyProps) {
    const t = useStrings()
    const dailyTicket = useDailyTicket(ticketId)

    return (
        <DetailQueryStates query={dailyTicket} strings={t.dailyTickets.detail}>
            {(data) => <DailyTicketDetailContent dailyTicket={data} titleRef={titleRef} />}
        </DetailQueryStates>
    )
}
