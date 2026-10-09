import { Drawer } from '@chakra-ui/react'
import type { RefObject } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useLastDefined } from '@/shared/lib/useLastDefined'
import { visibleRowLink } from '@/shared/lib/visibleRowLink'
import { DetailDrawer, DetailDrawerHeader } from '@/shared/ui/DetailDrawer'

import { useDailyTicket } from '../api/useDailyTickets'

import { DailyTicketDetailBody } from './DailyTicketDetailBody'

interface DailyTicketDetailDrawerProps {
    /** The daily ticket in the URL; undefined while no detail is open. */
    ticketId: string | undefined
    onClose: () => void
}

export function DailyTicketDetailDrawer({ ticketId, onClose }: DailyTicketDetailDrawerProps) {
    // Keeps the content while the drawer slides out after the URL has moved on.
    const shownTicketId = useLastDefined(ticketId)

    return (
        <DetailDrawer
            isOpen={ticketId !== undefined}
            onClose={onClose}
            finalFocusEl={() =>
                shownTicketId === undefined ? null : visibleRowLink(shownTicketId)
            }
        >
            {(titleRef) =>
                shownTicketId !== undefined && (
                    <DailyTicketDetailPanel
                        key={shownTicketId}
                        ticketId={shownTicketId}
                        titleRef={titleRef}
                    />
                )
            }
        </DetailDrawer>
    )
}

interface DailyTicketDetailPanelProps {
    ticketId: string
    titleRef: RefObject<HTMLHeadingElement | null>
}

function DailyTicketDetailPanel({ ticketId, titleRef }: DailyTicketDetailPanelProps) {
    const t = useStrings()
    const dailyTicket = useDailyTicket(ticketId)
    const strings = t.dailyTickets.detail

    return (
        <>
            <DetailDrawerHeader
                title={
                    dailyTicket.data === undefined
                        ? strings.fallbackTitle
                        : strings.title(dailyTicket.data.plate)
                }
                titleRef={titleRef}
                closeLabel={strings.close}
                backLabel={strings.back}
            />

            <Drawer.Body p={{ base: '4', md: '6' }}>
                <DailyTicketDetailBody ticketId={ticketId} titleRef={titleRef} />
            </Drawer.Body>
        </>
    )
}
