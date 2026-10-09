import { Box, Flex, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'
import { formatDateTime } from '@/shared/lib/format'
import { ListPagination } from '@/shared/ui/ListPagination'
import { ProcessingStatusChip } from '@/shared/ui/ProcessingStatusChip'

import type { PageRange } from '../lib/pageRange'
import type { Ticket } from '../validators/ticket'

import { TicketLink } from './TicketLink'

function cardFields(
    ticket: Ticket,
    columns: Dictionary['tickets']['columns'],
): { label: string; value: ReactNode }[] {
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
                        <TicketLink
                            ticketId={ticket.id}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            minH="12"
                            textDecoration="none"
                        >
                            <Text
                                as="span"
                                textStyle="plate"
                                fontSize="1.0625rem"
                                fontWeight="semibold"
                            >
                                {ticket.plate}
                            </Text>
                            <HStack as="span" gap="1" textStyle="sm" fontWeight="semibold">
                                {t.tickets.details}
                                <ChevronRight size="16" aria-hidden="true" />
                            </HStack>
                        </TicketLink>

                        <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap="3">
                            {cardFields(ticket, t.tickets.columns).map(({ label, value }) => (
                                <Box key={label}>
                                    <Text as="dt" fontSize="caption" color="fg.muted">
                                        {label}
                                    </Text>
                                    <Box as="dd">{value}</Box>
                                </Box>
                            ))}
                        </Grid>
                    </Stack>
                ))}
            </Stack>

            <Flex justify="space-between" align="center" gap="3">
                <Text textStyle="sm" color="fg.muted">
                    {t.tickets.shownShort(range.from, range.to, range.total)}
                </Text>
                <ListPagination
                    label={t.pagination.listLabel}
                    page={page}
                    pageSize={range.pageSize}
                    totalCount={range.total}
                    onPageChange={onPageChange}
                />
            </Flex>
        </Stack>
    )
}
