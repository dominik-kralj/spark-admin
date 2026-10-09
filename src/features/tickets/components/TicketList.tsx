import { Button, Text } from '@chakra-ui/react'
import { Ticket } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { pageParam, usePageSearchParam } from '@/shared/lib/usePageSearchParam'
import { useSortSearchParams, type Sort } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useTickets } from '../api/useTickets'
import { pageRange } from '../lib/pageRange'
import type { TicketFilters, TicketSortKey } from '../validators/ticket'

import { TicketCards } from './TicketCards'
import { TicketTable } from './TicketTable'

const sortKeys = ['createdAt', 'plate', 'amount', 'validUntil'] as const

const defaultSort: Sort<TicketSortKey> = { key: 'createdAt', direction: 'desc' }

// A new order starts again from the first page.
const resetOnSort = [pageParam]

const pageSize = 25

const noFilters: TicketFilters = {}

const skeletonColumnWidths = [2, 2, 1, 1, 1, 2, 2, 2]

export function TicketList() {
    const t = useStrings()
    const { page, setPage } = usePageSearchParam()
    const { sort, sortBy } = useSortSearchParams(sortKeys, defaultSort, resetOnSort)
    const tickets = useTickets({ page, pageSize, sort, filters: noFilters })

    if (tickets.isPending) {
        return <LoadingState label={t.tickets.loading} columnWidths={skeletonColumnWidths} />
    }

    if (tickets.isError) {
        return (
            <ErrorState
                title={t.tickets.errorTitle}
                error={tickets.error}
                onRetry={() => void tickets.refetch()}
                isRetrying={tickets.isFetching}
            />
        )
    }

    if (tickets.data.totalCount === 0) {
        return (
            <EmptyState
                icon={<Ticket />}
                title={t.tickets.empty.title}
                description={t.tickets.empty.description}
            />
        )
    }

    if (tickets.data.items.length === 0) {
        return (
            <EmptyState
                icon={<Ticket />}
                title={t.tickets.pastEnd.title}
                description={t.tickets.pastEnd.description}
                action={
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPage(1)
                        }}
                    >
                        {t.tickets.pastEnd.action}
                    </Button>
                }
            />
        )
    }

    const range = pageRange(tickets.data)

    return (
        <>
            <TicketTable
                tickets={tickets.data.items}
                range={range}
                isUpdating={tickets.isPlaceholderData}
                sort={sort}
                onSort={sortBy}
                page={page}
                onPageChange={setPage}
            />
            <Text hideBelow="md" hideFrom="lg" textStyle="sm" color="fg.muted">
                {t.tickets.moreInDetail}
            </Text>
            <TicketCards
                tickets={tickets.data.items}
                range={range}
                isUpdating={tickets.isPlaceholderData}
                page={page}
                onPageChange={setPage}
            />
        </>
    )
}
