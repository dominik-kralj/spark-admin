import { Table } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { formatAmount, formatDateTime } from '@/shared/lib/format'
import type { PageRange } from '@/shared/lib/pageRange'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { visibleRowLink } from '@/shared/lib/visibleRowLink'
import { paths } from '@/shared/paths'
import { MissingValue } from '@/shared/ui/MissingValue'
import { RowLink } from '@/shared/ui/RowLink'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePageFooter } from '@/shared/ui/TablePageFooter'
import { TablePanel } from '@/shared/ui/TablePanel'

import { canFiscalizeAgain } from '../lib/fiscalizeRequest'
import type { DailyTicket, DailyTicketSortKey } from '../validators/dailyTicket'

import { DailyTicketFiscalChip } from './DailyTicketFiscalChip'
import { FiscalizeAgainButton } from './FiscalizeAgainButton'

interface DailyTicketTableProps {
    dailyTickets: DailyTicket[]
    range: PageRange
    isUpdating: boolean
    sort: Sort<DailyTicketSortKey>
    onSort: (key: DailyTicketSortKey) => void
    page: number
    onPageChange: (page: number) => void
}

export function DailyTicketTable({
    dailyTickets,
    range,
    isUpdating,
    sort,
    onSort,
    page,
    onPageChange,
}: DailyTicketTableProps) {
    const t = useStrings()
    const { columns } = t.dailyTickets
    const directionOf = (key: DailyTicketSortKey) => (sort.key === key ? sort.direction : null)

    return (
        <TablePanel
            label={t.dailyTickets.listLabel}
            isBusy={isUpdating}
            footer={<TablePageFooter range={range} page={page} onPageChange={onPageChange} />}
        >
            <Table.Header>
                <Table.Row>
                    <SortableColumnHeader
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
                    <Table.ColumnHeader hideBelow="lg">{columns.address}</Table.ColumnHeader>
                    <SortableColumnHeader
                        hideBelow="lg"
                        label={columns.inspector}
                        direction={directionOf('inspector')}
                        onSort={() => {
                            onSort('inspector')
                        }}
                    />
                    <Table.ColumnHeader hideBelow="lg" textAlign="end">
                        {columns.amount}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader>{columns.fiscal}</Table.ColumnHeader>
                    <Table.ColumnHeader>{columns.action}</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {dailyTickets.map((dailyTicket) => (
                    <Table.Row key={dailyTicket.id}>
                        <Table.Cell>{formatDateTime(dailyTicket.createdAt)}</Table.Cell>
                        <Table.Cell>
                            <RowLink
                                listPath={paths.dailyTickets}
                                id={dailyTicket.id}
                                textStyle="plate"
                                fontWeight="semibold"
                            >
                                {dailyTicket.plate}
                            </RowLink>
                        </Table.Cell>
                        <Table.Cell>{dailyTicket.zone.code}</Table.Cell>
                        <Table.Cell hideBelow="lg">
                            {dailyTicket.address ?? <MissingValue />}
                        </Table.Cell>
                        <Table.Cell hideBelow="lg">{dailyTicket.inspector.name}</Table.Cell>
                        <Table.Cell hideBelow="lg" textAlign="end">
                            {formatAmount(dailyTicket.amount)}
                        </Table.Cell>
                        <Table.Cell>
                            <DailyTicketFiscalChip
                                id={dailyTicket.id}
                                status={dailyTicket.fiscal.status}
                            />
                        </Table.Cell>
                        <Table.Cell>
                            {canFiscalizeAgain(dailyTicket) && (
                                <FiscalizeAgainButton
                                    ticket={dailyTicket}
                                    fallbackFocus={() => visibleRowLink(dailyTicket.id)}
                                    variant="outline"
                                    size="sm"
                                />
                            )}
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </TablePanel>
    )
}
