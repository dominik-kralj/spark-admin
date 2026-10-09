import { Stack } from '@chakra-ui/react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'
import { formatDateTime } from '@/shared/lib/format'
import type { PageRange } from '@/shared/lib/pageRange'
import { paths } from '@/shared/paths'
import { CardDetailLink } from '@/shared/ui/CardDetailLink'
import { CardFields } from '@/shared/ui/CardFields'
import type { DetailField } from '@/shared/ui/DetailFields'
import { CardsPageFooter } from '@/shared/ui/PageFooters'
import { ProcessingStatusChip } from '@/shared/ui/ProcessingStatusChip'

import type { Ticket } from '../validators/ticket'

function cardFields(ticket: Ticket, columns: Dictionary['tickets']['columns']): DetailField[] {
    return [
        { label: columns.zone, value: ticket.zone.code },
        { label: columns.validUntil, value: formatDateTime(ticket.validUntil) },
        {
            label: columns.payment,
            value: <ProcessingStatusChip stage="payment" status={ticket.payment.status} />,
        },
        {
            label: columns.fiscal,
            value: <ProcessingStatusChip stage="fiscal" status={ticket.fiscal.status} />,
        },
    ]
}

interface TicketCardsProps {
    tickets: Ticket[]
    range: PageRange
    isUpdating: boolean
    page: number
    onPageChange: (page: number) => void
}

export function TicketCards({ tickets, range, isUpdating, page, onPageChange }: TicketCardsProps) {
    const t = useStrings()

    return (
        <Stack hideFrom="md" gap="3">
            <Stack
                as="ul"
                aria-label={t.tickets.listLabel}
                aria-busy={isUpdating}
                gap="2"
                listStyleType="none"
            >
                {tickets.map((ticket) => (
                    <Stack as="li" key={ticket.id} layerStyle="panel" gap="2" px="4" pb="4">
                        <CardDetailLink
                            listPath={paths.tickets}
                            id={ticket.id}
                            plate={ticket.plate}
                        />
                        <CardFields fields={cardFields(ticket, t.tickets.columns)} />
                    </Stack>
                ))}
            </Stack>

            <CardsPageFooter range={range} page={page} onPageChange={onPageChange} />
        </Stack>
    )
}
