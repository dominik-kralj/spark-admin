import { Button } from '@chakra-ui/react'
import { CarFront, SearchX } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { Sort } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import type { usePrivilegedOwners } from '../api/usePrivilegedOwners'
import { sortPrivilegedOwners, type PrivilegedOwnerSortKey } from '../lib/sortPrivilegedOwners'
import type { PrivilegedOwnerRow, ValidityFilter } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { AddPrivilegedOwnerButton } from './AddPrivilegedOwnerButton'
import { PrivilegedOwnerCards } from './PrivilegedOwnerCards'
import { PrivilegedOwnerTable } from './PrivilegedOwnerTable'

const skeletonColumnWidths = [1, 1, 1, 2, 3, 1]

interface PrivilegedOwnerResultsProps {
    query: ReturnType<typeof usePrivilegedOwners>
    /** The entries the plate search matches, in every tab. */
    matchingCount: number
    /** The entries the plate search and the tab both match. */
    visible: PrivilegedOwnerRow[]
    validity: ValidityFilter
    sort: Sort<PrivilegedOwnerSortKey>
    onSort: (key: PrivilegedOwnerSortKey) => void
    onAdd: () => void
    onEdit: (owner: PrivilegedOwner) => void
    onDelete: (owner: PrivilegedOwner) => void
    onClearSearch: () => void
}

export function PrivilegedOwnerResults({
    query,
    matchingCount,
    visible,
    validity,
    sort,
    onSort,
    onAdd,
    onEdit,
    onDelete,
    onClearSearch,
}: PrivilegedOwnerResultsProps) {
    const t = useStrings()

    if (query.isPending) {
        return (
            <LoadingState label={t.privilegedOwners.loading} columnWidths={skeletonColumnWidths} />
        )
    }

    if (query.isError) {
        return (
            <ErrorState
                title={t.privilegedOwners.errorTitle}
                error={query.error}
                onRetry={() => void query.refetch()}
                isRetrying={query.isFetching}
            />
        )
    }

    if (query.data.length === 0) {
        return (
            <EmptyState
                icon={<CarFront />}
                title={t.privilegedOwners.empty.title}
                description={t.privilegedOwners.empty.description}
                action={<AddPrivilegedOwnerButton onClick={onAdd} />}
            />
        )
    }

    if (matchingCount === 0) {
        return (
            <EmptyState
                icon={<SearchX />}
                title={t.privilegedOwners.noMatch.title}
                description={t.privilegedOwners.noMatch.description}
                action={
                    <Button variant="outline" onClick={onClearSearch}>
                        {t.privilegedOwners.noMatch.clear}
                    </Button>
                }
            />
        )
    }

    if (visible.length === 0 && validity !== 'all') {
        const emptyTab = t.privilegedOwners.emptyTab[validity]

        return (
            <EmptyState
                icon={<CarFront />}
                title={emptyTab.title}
                description={emptyTab.description}
            />
        )
    }

    const sorted = sortPrivilegedOwners(visible, sort)

    return (
        <>
            <PrivilegedOwnerTable
                rows={sorted}
                total={query.data.length}
                sort={sort}
                onSort={onSort}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <PrivilegedOwnerCards rows={sorted} onEdit={onEdit} />
        </>
    )
}
