import { HStack, IconButton, Table } from '@chakra-ui/react'
import { Pencil, Trash2 } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePanel } from '@/shared/ui/TablePanel'

import { expiredTint } from '../lib/expiredTint'
import { formatAddress } from '../lib/formatAddress'
import type { PrivilegedOwnerSortKey } from '../lib/sortPrivilegedOwners'
import type { PrivilegedOwnerRow } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { ValidUntilText } from './ValidUntilText'
import { ValidityChip } from './ValidityChip'

interface PrivilegedOwnerTableProps {
    rows: PrivilegedOwnerRow[]
    total: number
    sort: Sort<PrivilegedOwnerSortKey>
    onSort: (key: PrivilegedOwnerSortKey) => void
    onEdit: (owner: PrivilegedOwner) => void
    onDelete: (owner: PrivilegedOwner) => void
}

export function PrivilegedOwnerTable({
    rows,
    total,
    sort,
    onSort,
    onEdit,
    onDelete,
}: PrivilegedOwnerTableProps) {
    const t = useStrings()
    const { columns } = t.privilegedOwners
    const directionOf = (key: PrivilegedOwnerSortKey) => (sort.key === key ? sort.direction : null)

    return (
        <TablePanel
            label={t.privilegedOwners.listLabel}
            footer={t.privilegedOwners.shown(rows.length, total)}
        >
            <Table.Header>
                <Table.Row>
                    <SortableColumnHeader
                        label={columns.plate}
                        direction={directionOf('plate')}
                        onSort={() => {
                            onSort('plate')
                        }}
                    />
                    <SortableColumnHeader
                        label={columns.validUntil}
                        direction={directionOf('validUntil')}
                        onSort={() => {
                            onSort('validUntil')
                        }}
                    />
                    <Table.ColumnHeader>{columns.status}</Table.ColumnHeader>
                    <Table.ColumnHeader>{columns.ownerName}</Table.ColumnHeader>
                    <Table.ColumnHeader>{columns.address}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">
                        {t.privilegedOwners.actions}
                    </Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {rows.map(({ owner, validity }) => (
                    <Table.Row key={owner.id} bg={expiredTint(validity)}>
                        <Table.Cell textStyle="plate">{owner.plate}</Table.Cell>
                        <Table.Cell>
                            <ValidUntilText validUntil={owner.validUntil} validity={validity} />
                        </Table.Cell>
                        <Table.Cell>
                            <ValidityChip validity={validity} />
                        </Table.Cell>
                        <Table.Cell>{owner.ownerName}</Table.Cell>
                        <Table.Cell>{formatAddress(owner.address)}</Table.Cell>
                        <Table.Cell>
                            <HStack gap="2" justify="flex-end">
                                <IconButton
                                    aria-label={t.privilegedOwners.editOwner(owner.plate)}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onEdit(owner)
                                    }}
                                >
                                    <Pencil aria-hidden="true" />
                                </IconButton>
                                <IconButton
                                    aria-label={t.privilegedOwners.delete.deleteOwner(owner.plate)}
                                    variant="outline"
                                    colorPalette="red"
                                    size="sm"
                                    onClick={() => {
                                        onDelete(owner)
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
