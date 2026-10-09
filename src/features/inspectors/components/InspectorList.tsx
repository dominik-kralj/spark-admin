import { UserCheck } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useSortSearchParams, type Sort } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useInspectors } from '../api/useInspectors'
import { sortInspectorsBySurname } from '../lib/sortInspectors'
import type { Inspector } from '../validators/inspector'

import { AddInspectorButton } from './AddInspectorButton'
import { InspectorCards } from './InspectorCards'
import { InspectorTable } from './InspectorTable'

const sortKeys = ['surname'] as const

const defaultSort: Sort<(typeof sortKeys)[number]> = { key: 'surname', direction: 'asc' }

const skeletonColumnWidths = [1, 1, 1, 1, 1]

interface InspectorListProps {
    onAdd: () => void
    onEdit: (inspector: Inspector) => void
    onDelete: (inspector: Inspector) => void
}

export function InspectorList({ onAdd, onEdit, onDelete }: InspectorListProps) {
    const t = useStrings()
    const inspectors = useInspectors()
    const { sort, sortBy } = useSortSearchParams(sortKeys, defaultSort)

    if (inspectors.isPending) {
        return <LoadingState label={t.inspectors.loading} columnWidths={skeletonColumnWidths} />
    }

    if (inspectors.isError) {
        return (
            <ErrorState
                title={t.inspectors.errorTitle}
                error={inspectors.error}
                onRetry={() => void inspectors.refetch()}
                isRetrying={inspectors.isFetching}
            />
        )
    }

    if (inspectors.data.length === 0) {
        return (
            <EmptyState
                icon={<UserCheck />}
                title={t.inspectors.empty.title}
                description={t.inspectors.empty.description}
                // The button shows from md: the phone design keeps only the header's add button.
                action={<AddInspectorButton onClick={onAdd} />}
            />
        )
    }

    const sortedInspectors = sortInspectorsBySurname(inspectors.data, sort.direction)

    return (
        <>
            <InspectorTable
                inspectors={sortedInspectors}
                surnameSortDirection={sort.direction}
                onSortBySurname={() => {
                    sortBy('surname')
                }}
                onEdit={onEdit}
                onDelete={onDelete}
            />
            <InspectorCards inspectors={sortedInspectors} onEdit={onEdit} onDelete={onDelete} />
        </>
    )
}
