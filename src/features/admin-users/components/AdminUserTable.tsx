import { HStack, IconButton, Table, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { SortDirection } from '@/shared/lib/useSortSearchParams'
import { SortableColumnHeader } from '@/shared/ui/SortableColumnHeader'
import { TablePanel } from '@/shared/ui/TablePanel'

import { fullName } from '../lib/fullName'
import type { AdminUser } from '../validators/adminUser'

import { YouChip } from './YouChip'

interface AdminUserTableProps {
    users: AdminUser[]
    signedInUserId: number | null
    usernameSortDirection: SortDirection
    onSortByUsername: () => void
    onEdit: (user: AdminUser) => void
}

export function AdminUserTable({
    users,
    signedInUserId,
    usernameSortDirection,
    onSortByUsername,
    onEdit,
}: AdminUserTableProps) {
    const t = useStrings()
    const { columns } = t.adminUsers

    return (
        <TablePanel label={t.adminUsers.listLabel} footer={t.adminUsers.total(users.length)}>
            <Table.Header>
                <Table.Row>
                    <SortableColumnHeader
                        label={columns.username}
                        direction={usernameSortDirection}
                        onSort={onSortByUsername}
                    />
                    <Table.ColumnHeader>{columns.fullName}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">{t.adminUsers.actions}</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {users.map((user) => (
                    <Table.Row key={user.id}>
                        <Table.Cell>
                            <HStack gap="2">
                                <Text fontWeight="semibold">{user.username}</Text>
                                {user.id === signedInUserId && <YouChip />}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell>{fullName(user)}</Table.Cell>
                        <Table.Cell textAlign="end">
                            <IconButton
                                aria-label={t.adminUsers.editAdminUser(user.username)}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onEdit(user)
                                }}
                            >
                                <Pencil aria-hidden="true" />
                            </IconButton>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </TablePanel>
    )
}
