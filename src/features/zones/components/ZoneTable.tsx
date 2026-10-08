import { Box, IconButton, Table, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { formatAmount, formatMinutes } from '@/shared/lib/format'
import type { SortDirection } from '@/shared/lib/useSortSearchParams'

import type { Zone } from '../validators/zone'

import { SortableColumnHeader } from './SortableColumnHeader'

interface ZoneTableProps {
    zones: Zone[]
    codeSortDirection: SortDirection
    onSortByCode: () => void
    onEdit: (zone: Zone) => void
}

export function ZoneTable({ zones, codeSortDirection, onSortByCode, onEdit }: ZoneTableProps) {
    const t = useStrings()
    const { columns } = t.zones

    return (
        <Box hideBelow="md" layerStyle="panel" overflow="hidden">
            <Table.ScrollArea>
                <Table.Root aria-label={t.zones.listLabel}>
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
                            <Table.ColumnHeader textAlign="end">
                                {columns.maxExtensions}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">
                                {columns.dpkIssueDelayMinutes}
                            </Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">
                                {t.zones.actions}
                            </Table.ColumnHeader>
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
                                <Table.Cell textAlign="end">
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
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>

            <Text px="4" py="3" borderTopWidth="1px" textStyle="sm" color="fg.muted">
                {t.zones.total(zones.length)}
            </Text>
        </Box>
    )
}
