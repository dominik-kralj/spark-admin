import { HStack, IconButton, Table } from '@chakra-ui/react'
import { Pencil, Trash2 } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { formatAmount, formatMinutes } from '@/shared/lib/format'
import type { SortDirection } from '@/shared/lib/useSortSearchParams'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePanel } from '@/shared/ui/TablePanel'

import type { Zone } from '../validators/zone'

interface ZoneTableProps {
    zones: Zone[]
    codeSortDirection: SortDirection
    onSortByCode: () => void
    onEdit: (zone: Zone) => void
    onDelete: (zone: Zone) => void
}

export function ZoneTable({
    zones,
    codeSortDirection,
    onSortByCode,
    onEdit,
    onDelete,
}: ZoneTableProps) {
    const t = useStrings()
    const { columns } = t.zones

    return (
        <TablePanel label={t.zones.listLabel} footer={t.zones.total(zones.length)}>
            <Table.Header>
                <Table.Row>
                    <SortableColumnHeader
                        label={columns.code}
                        direction={codeSortDirection}
                        onSort={onSortByCode}
                    />
                    <Table.ColumnHeader>{columns.name}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">{columns.price}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                        {columns.dailyTicketPrice}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                        {columns.durationMinutes}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">{columns.maxExtensions}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                        {columns.dpkIssueDelayMinutes}
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">{t.zones.actions}</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {zones.map((zone) => (
                    <Table.Row key={zone.id}>
                        <Table.Cell fontWeight="semibold">{zone.code}</Table.Cell>
                        <Table.Cell>{zone.name}</Table.Cell>
                        <Table.Cell textAlign="end">{formatAmount(zone.price)}</Table.Cell>
                        <Table.Cell textAlign="end">
                            {formatAmount(zone.dailyTicketPrice)}
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                            {formatMinutes(zone.durationMinutes)}
                        </Table.Cell>
                        <Table.Cell textAlign="end">{zone.maxExtensions}</Table.Cell>
                        <Table.Cell textAlign="end">
                            {formatMinutes(zone.dpkIssueDelayMinutes)}
                        </Table.Cell>
                        <Table.Cell>
                            <HStack gap="2" justify="flex-end">
                                <IconButton
                                    aria-label={t.zones.editZone(zone.code)}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onEdit(zone)
                                    }}
                                >
                                    <Pencil aria-hidden="true" />
                                </IconButton>
                                <IconButton
                                    aria-label={t.zones.delete.deleteZone(zone.code)}
                                    variant="outline"
                                    colorPalette="red"
                                    size="sm"
                                    onClick={() => {
                                        onDelete(zone)
                                    }}
                                >
                                    <Trash2 aria-hidden="true" />
                                </IconButton>
                            </HStack>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </TablePanel>
    )
}
