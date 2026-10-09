import { Link, type LinkProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'

import { fromListState, ticketDetailPath } from '../lib/detailLink'

interface TicketLinkProps extends Omit<LinkProps, 'asChild' | 'href'> {
    ticketId: string
    children: ReactNode
}

/** Opens a ticket's detail over the list. */
export function TicketLink({ ticketId, children, ...linkProps }: TicketLinkProps) {
    const { search } = useLocation()

    return (
        <Link asChild color="spark.blue.700" textDecoration="underline" {...linkProps}>
            <RouterLink
                to={ticketDetailPath(ticketId, search)}
                state={fromListState}
                data-ticket-link={ticketId}
            >
                {children}
            </RouterLink>
        </Link>
    )
}
