import { Drawer } from '@chakra-ui/react'
import type { RefObject } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useLastDefined } from '@/shared/lib/useLastDefined'
import { visibleRowLink } from '@/shared/lib/visibleRowLink'
import { DetailDrawer, DetailDrawerHeader } from '@/shared/ui/DetailDrawer'

import { useTicket } from '../api/useTickets'

import { TicketDetailBody } from './TicketDetailBody'

interface TicketDetailDrawerProps {
    /** The ticket in the URL; undefined while no detail is open. */
    ticketId: string | undefined
    onClose: () => void
}

export function TicketDetailDrawer({ ticketId, onClose }: TicketDetailDrawerProps) {
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
                    <TicketDetailPanel
                        key={shownTicketId}
                        ticketId={shownTicketId}
                        titleRef={titleRef}
                    />
                )
            }
        </DetailDrawer>
    )
}

interface TicketDetailPanelProps {
    ticketId: string
    titleRef: RefObject<HTMLHeadingElement | null>
}

function TicketDetailPanel({ ticketId, titleRef }: TicketDetailPanelProps) {
    const t = useStrings()
    const ticket = useTicket(ticketId)
    const strings = t.tickets.detail

    return (
        <>
            <DetailDrawerHeader
                title={
                    ticket.data === undefined
                        ? strings.fallbackTitle
                        : strings.title(ticket.data.plate)
                }
                titleRef={titleRef}
                closeLabel={strings.close}
                backLabel={strings.back}
            />

            <Drawer.Body p={{ base: '4', md: '6' }}>
                <TicketDetailBody ticketId={ticketId} />
            </Drawer.Body>
        </>
    )
}
