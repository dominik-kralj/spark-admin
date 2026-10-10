import type { UseQueryResult } from '@tanstack/react-query'
import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'

import { isApiError } from '@/shared/api'

import { DetailLoading } from './DetailLoading'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'

interface DetailQueryStatesProps<TData> {
    query: UseQueryResult<TData>
    strings: {
        loading: string
        errorTitle: string
        notFound: { title: string; description: string }
    }
    children: (data: TData) => ReactNode
}

/** A detail's body: loading, not found (also another city's), error with retry, or the data. */
export function DetailQueryStates<TData>({
    query,
    strings,
    children,
}: DetailQueryStatesProps<TData>) {
    if (query.isPending) return <DetailLoading label={strings.loading} />

    if (query.isError && isApiError(query.error) && query.error.kind === 'notFound') {
        return (
            <EmptyState
                icon={<SearchX />}
                title={strings.notFound.title}
                description={strings.notFound.description}
            />
        )
    }

    if (query.isError) {
        return (
            <ErrorState
                title={strings.errorTitle}
                error={query.error}
                onRetry={() => void query.refetch()}
                isRetrying={query.isFetching}
            />
        )
    }

    return children(query.data)
}
