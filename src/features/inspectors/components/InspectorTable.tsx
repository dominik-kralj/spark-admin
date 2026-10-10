import { HStack, IconButton, Table } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { fullName } from '@/shared/lib/fullName'
import type { SortDirection } from '@/shared/lib/useSortSearchParams'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePanel } from '@/shared/ui/TablePanel'

import { inactiveTint } from '../lib/inactiveTint'
import type { Inspector } from '../validators/inspector'

import { InspectorDeleteButton } from './InspectorDeleteButton'
import { InspectorStatusChip } from './InspectorStatusChip'

interface InspectorTableProps {
    inspectors: Inspector[]
    surnameSortDirection: SortDirection
    onSortBySurname: () => void
    onEdit: (inspector: Inspector) => void
    onDelete: (inspector: Inspector) => void
}

export function InspectorTable({
    inspectors,
    surnameSortDirection,
    onSortBySurname,
    onEdit,
    onDelete,
}: InspectorTableProps) {
    const t = useStrings()
    const { columns } = t.inspectors
    const activeCount = inspectors.filter((inspector) => inspector.isActive).length

    return (
        <TablePanel
            label={t.inspectors.listLabel}
            footer={t.inspectors.total(inspectors.length, activeCount)}
        >
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>{columns.name}</Table.ColumnHeader>
                    <SortableColumnHeader
                        label={columns.surname}
                        direction={surnameSortDirection}
                        onSort={onSortBySurname}
                    />
                    <Table.ColumnHeader>{columns.oib}</Table.ColumnHeader>
                    <Table.ColumnHeader>{columns.status}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">{t.inspectors.actions}</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {inspectors.map((inspector) => (
                    <Table.Row key={inspector.id} bg={inactiveTint(inspector.isActive)}>
                        <Table.Cell>{inspector.name}</Table.Cell>
                        <Table.Cell fontWeight="semibold">{inspector.surname}</Table.Cell>
                        <Table.Cell fontFamily="mono">{inspector.oib}</Table.Cell>
                        <Table.Cell>
                            <InspectorStatusChip isActive={inspector.isActive} />
                        </Table.Cell>
                        <Table.Cell textAlign="end">
                            <HStack gap="2" justify="flex-end">
                                <IconButton
                                    aria-label={t.inspectors.editInspector(fullName(inspector))}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onEdit(inspector)
                                    }}
                                >
                                    <Pencil aria-hidden="true" />
                                </IconButton>
                                <InspectorDeleteButton
                                    inspector={inspector}
                                    onDelete={onDelete}
                                    placement="row"
                                />
                            </HStack>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </TablePanel>
    )
}
