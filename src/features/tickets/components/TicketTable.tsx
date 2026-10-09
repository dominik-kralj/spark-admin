import { Table, Text } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { formatAmount, formatDateTime, formatMinutes } from '@/shared/lib/format'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { ListPagination } from '@/shared/ui/ListPagination'
import { ProcessingStatusChip } from '@/shared/ui/ProcessingStatusChip'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePanel } from '@/shared/ui/TablePanel'

import type { PageRange } from '../lib/pageRange'
import type { Ticket, TicketSortKey } from '../validators/ticket'

import { TicketLink } from './TicketLink'

interface TicketTableProps {
    tickets: Ticket[]
    range: PageRange
    isUpdating: boolean
    sort: Sort<TicketSortKey>
    onSort: (key: TicketSortKey) => void
    page: number
    onPageChange: (page: number) => void
}

export function TicketTable({
    tickets,
    range,
    isUpdating,
    sort,
    onSort,
    page,
    onPageChange,
}: TicketTableProps) {
    const t = useStrings()
    const { columns } = t.tickets
    const directionOf = (key: TicketSortKey) => (sort.key === key ? sort.direction : null)

    return (
        <TablePanel
            label={t.tickets.listLabel}
            isBusy={isUpdating}
            footer={
                <>
                    <Text>{t.tickets.shown(range.from, range.to, range.total)}</Text>
                    <ListPagination
                        label={t.pagination.tableLabel}
                        page={page}
                        pageSize={range.pageSize}
                        totalCount={range.total}
                        onPageChange={onPageChange}
                        hasPageNumbers
                    />
                </>
            }
        >
            <Table.Header>
                <Table.Row>
                    <SortableColumnHeader
                        hideBelow="lg"
                        label={columns.createdAt}
                        direction={directionOf('createdAt')}
                        onSort={() => {
                            onSort('createdAt')
                        }}
                    />
                    <SortableColumnHeader
                        label={columns.plate}
                        direction={directionOf('plate')}
                        onSort={() => {
                            onSort('plate')
                        }}
                    />
                    <Table.ColumnHeader>{columns.zone}</Table.ColumnHeader>
                    <Table.ColumnHeader hideBelow="lg" textAlign="end">
                        {columns.duration}
                    </Table.ColumnHeader>
                    <SortableColumnHeader
                        hideBelow="lg"
                        textAlign="end"
                        label={columns.amount}
                        direction={directionOf('amount')}
                        onSort={() => {
                            onSort('amount')
                        }}
                    />
                    <SortableColumnHeader
                        label={columns.validUntil}
                        direction={directionOf('validUntil')}
                        onSort={() => {
                            onSort('validUntil')
                        }}
                    />
                    <Table.ColumnHeader>{columns.payment}</Table.ColumnHeader>
                    <Table.ColumnHeader>{columns.fiscal}</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {tickets.map((ticket) => (
                    <Table.Row key={ticket.id}>
                        <Table.Cell hideBelow="lg">{formatDateTime(ticket.createdAt)}</Table.Cell>
                        <Table.Cell>
                            <TicketLink
                                ticketId={ticket.id}
                                textStyle="plate"
                                fontWeight="semibold"
                            >
                                {ticket.plate}
                            </TicketLink>
                        </Table.Cell>
                        <Table.Cell>{ticket.zone.code}</Table.Cell>
                        <Table.Cell hideBelow="lg" textAlign="end">
                            {formatMinutes(ticket.parkingMinutes)}
                        </Table.Cell>
                        <Table.Cell hideBelow="lg" textAlign="end">
                            {formatAmount(ticket.amount)}
                        </Table.Cell>
                        <Table.Cell>{formatDateTime(ticket.validUntil)}</Table.Cell>
                        <Table.Cell>
                            <ProcessingStatusChip stage="payment" status={ticket.payment.status} />
                        </Table.Cell>
                        <Table.Cell>
                            <ProcessingStatusChip stage="fiscal" status={ticket.fiscal.status} />
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </TablePanel>
    )
}
