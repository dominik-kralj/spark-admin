import { IconButton, Table } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePanel } from '@/shared/ui/TablePanel'

import { formatAddress } from '../lib/formatAddress'
import type { PrivilegedOwnerSortKey } from '../lib/sortPrivilegedOwners'
import { validityOf } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { ValidUntilText } from './ValidUntilText'
import { ValidityChip } from './ValidityChip'

interface PrivilegedOwnerTableProps {
    owners: PrivilegedOwner[]
    now: Date
    total: number
    sort: Sort<PrivilegedOwnerSortKey>
    onSort: (key: PrivilegedOwnerSortKey) => void
    onEdit: (owner: PrivilegedOwner) => void
}

export function PrivilegedOwnerTable({
    owners,
    now,
    total,
    sort,
    onSort,
    onEdit,
}: PrivilegedOwnerTableProps) {
    const t = useStrings()
    const { columns } = t.privilegedOwners
    const directionOf = (key: PrivilegedOwnerSortKey) => (sort.key === key ? sort.direction : null)

    return (
        <TablePanel
            label={t.privilegedOwners.listLabel}
            footer={t.privilegedOwners.shown(owners.length, total)}
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
                {owners.map((owner) => {
                    const validity = validityOf(owner, now)

                    return (
                        <Table.Row
                            key={owner.id}
                            bg={validity === 'expired' ? 'bg.subtle' : undefined}
                        >
                            <Table.Cell fontFamily="mono" fontWeight="semibold">
                                {owner.plate}
                            </Table.Cell>
                            <Table.Cell>
                                <ValidUntilText owner={owner} validity={validity} />
                            </Table.Cell>
                            <Table.Cell>
                                <ValidityChip validity={validity} />
                            </Table.Cell>
                            <Table.Cell>{owner.ownerName}</Table.Cell>
                            <Table.Cell>{formatAddress(owner.address)}</Table.Cell>
                            <Table.Cell textAlign="end">
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
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>
        </TablePanel>
    )
}
