import { Users } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { sortByText } from '@/shared/lib/sortByText'
import { useSortSearchParams, type Sort } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useAdminUsers } from '../api/useAdminUsers'
import type { AdminUser } from '../validators/adminUser'

import { AddAdminUserButton } from './AddAdminUserButton'
import { AdminUserCards } from './AdminUserCards'
import { AdminUserTable } from './AdminUserTable'

const sortKeys = ['username'] as const

const defaultSort: Sort<(typeof sortKeys)[number]> = { key: 'username', direction: 'asc' }

const skeletonColumnWidths = [1, 1, 1]

interface AdminUserListProps {
    signedInUserId: number | null
    onAdd: () => void
    onEdit: (user: AdminUser) => void
    onDelete: (user: AdminUser) => void
}

export function AdminUserList({ signedInUserId, onAdd, onEdit, onDelete }: AdminUserListProps) {
    const t = useStrings()
    const users = useAdminUsers()
    const { sort, sortBy } = useSortSearchParams(sortKeys, defaultSort)

    if (users.isPending) {
        return <LoadingState label={t.adminUsers.loading} columnWidths={skeletonColumnWidths} />
    }

    if (users.isError) {
        return (
            <ErrorState
                title={t.adminUsers.errorTitle}
                error={users.error}
                onRetry={() => void users.refetch()}
                isRetrying={users.isFetching}
            />
        )
    }

    if (users.data.length === 0) {
        return (
            <EmptyState
                icon={<Users />}
                title={t.adminUsers.empty.title}
                description={t.adminUsers.empty.description}
                // The button shows from md: the phone design keeps only the header's add button.
                action={<AddAdminUserButton onClick={onAdd} />}
            />
        )
    }

    const sortedUsers = sortByText(users.data, (user) => [user.username], sort.direction)

    return (
        <>
            <AdminUserTable
                users={sortedUsers}
                signedInUserId={signedInUserId}
                usernameSortDirection={sort.direction}
                onSortByUsername={() => {
                    sortBy('username')
                }}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            {/* The phone design deletes from the form only. */}
            <AdminUserCards users={sortedUsers} signedInUserId={signedInUserId} onEdit={onEdit} />
        </>
    )
}
