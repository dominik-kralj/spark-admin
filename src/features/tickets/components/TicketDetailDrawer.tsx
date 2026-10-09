import { Button, Drawer, Flex, IconButton, Portal } from '@chakra-ui/react'
import { ArrowLeft, X } from 'lucide-react'
import { useRef, type RefObject } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useLastDefined } from '@/shared/lib/useLastDefined'

import { useTicket } from '../api/useTickets'

import { TicketDetailBody } from './TicketDetailBody'

/** The row link for this ticket that is on screen: the table's or the card's. */
function visibleRowLink(ticketId: string): HTMLElement | null {
    const links = document.querySelectorAll<HTMLElement>('[data-ticket-link]')

    return (
        [...links].find(
            (link) => link.dataset.ticketLink === ticketId && link.getClientRects().length > 0,
        ) ?? null
    )
}

interface TicketDetailDrawerProps {
    /** The ticket in the URL; undefined while no detail is open. */
    ticketId: string | undefined
    onClose: () => void
}

export function TicketDetailDrawer({ ticketId, onClose }: TicketDetailDrawerProps) {
    const t = useStrings()
    const titleRef = useRef<HTMLHeadingElement>(null)
    // Keeps the content while the drawer slides out after the URL has moved on.
    const shownTicketId = useLastDefined(ticketId)

    return (
        <Drawer.Root
            open={ticketId !== undefined}
            onOpenChange={({ open }) => {
                if (!open) onClose()
            }}
            initialFocusEl={() => titleRef.current}
            // Opened from a link, focus would return to it anyway; opened from the URL, it goes there too.
            finalFocusEl={() =>
                shownTicketId === undefined ? null : visibleRowLink(shownTicketId)
            }
            lazyMount
            unmountOnExit
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content w="full" maxW={{ base: '100vw', md: '560px' }}>
                        {shownTicketId !== undefined && (
                            <TicketDetailPanel
                                key={shownTicketId}
                                ticketId={shownTicketId}
                                titleRef={titleRef}
                            />
                        )}

                        <Drawer.Footer
                            hideBelow="md"
                            borderTopWidth="1px"
                            borderColor="border"
                            px="6"
                            py="4"
                        >
                            <Drawer.ActionTrigger asChild>
                                <Button variant="outline">{t.tickets.detail.closeButton}</Button>
                            </Drawer.ActionTrigger>
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
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
            <Flex
                direction={{ base: 'row', md: 'row-reverse' }}
                justify={{ base: 'flex-start', md: 'space-between' }}
                align="center"
                gap={{ base: '1', md: '4' }}
                minH="14"
                py={{ md: '4' }}
                pl={{ base: '1.5', md: '6' }}
                pr="4"
                flex="none"
                borderBottomWidth="1px"
                borderColor="border"
            >
                <Drawer.CloseTrigger asChild position="static" hideFrom="md">
                    <IconButton aria-label={strings.back} variant="ghost">
                        <ArrowLeft aria-hidden="true" />
                    </IconButton>
                </Drawer.CloseTrigger>
                <Drawer.CloseTrigger asChild position="static" hideBelow="md">
                    <IconButton aria-label={strings.close} variant="ghost">
                        <X aria-hidden="true" />
                    </IconButton>
                </Drawer.CloseTrigger>
                <Drawer.Title ref={titleRef} tabIndex={-1} textStyle="lg">
                    {ticket.data === undefined
                        ? strings.fallbackTitle
                        : strings.title(ticket.data.plate)}
                </Drawer.Title>
            </Flex>

            <Drawer.Body p={{ base: '4', md: '6' }}>
                <TicketDetailBody ticket={ticket} />
            </Drawer.Body>
        </>
    )
}
