import { Button, Text } from '@chakra-ui/react'
import { ClipboardList } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { pageRange } from '@/shared/lib/pageRange'
import { pageParam, usePageSearchParam } from '@/shared/lib/usePageSearchParam'
import { useSearchParams } from '@/shared/lib/useSearchParams'
import { useSortSearchParams } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useDailyTickets } from '../api/useDailyTickets'
import {
    dailyTicketSortKeys,
    defaultDailyTicketSort,
    readDailyTicketListParams,
} from '../lib/dailyTicketListParams'

import { DailyTicketCards } from './DailyTicketCards'
import { DailyTicketTable } from './DailyTicketTable'

// A new order starts again from the first page.
const resetOnSort = [pageParam]

const skeletonColumnWidths = [2, 2, 1, 3, 2, 1, 2, 2]

interface DailyTicketListProps {
    onClearFilters: () => void
}

export function DailyTicketList({ onClearFilters }: DailyTicketListProps) {
    const t = useStrings()
    const strings = t.dailyTickets
    const { searchParams } = useSearchParams()
    const params = readDailyTicketListParams(searchParams)
    const { page, sort, filters } = params
    const { setPage } = usePageSearchParam()
    const { sortBy } = useSortSearchParams(dailyTicketSortKeys, defaultDailyTicketSort, resetOnSort)
    const dailyTickets = useDailyTickets(params)
    const isFiltered = Object.keys(filters).length > 0

    if (dailyTickets.isPending) {
        return <LoadingState label={strings.loading} columnWidths={skeletonColumnWidths} />
    }

    if (dailyTickets.isError) {
        return (
            <ErrorState
                title={strings.errorTitle}
                error={dailyTickets.error}
                onRetry={() => void dailyTickets.refetch()}
                isRetrying={dailyTickets.isFetching}
            />
        )
    }

    if (dailyTickets.data.totalCount === 0 && isFiltered) {
        return (
            <EmptyState
                icon={<ClipboardList />}
                title={strings.filters.noResults.title}
                description={strings.filters.noResults.description}
                action={
                    <Button variant="outline" onClick={onClearFilters}>
                        {t.ticketFilters.clearAll}
                    </Button>
                }
            />
        )
    }

    if (dailyTickets.data.totalCount === 0) {
        return (
            <EmptyState
                icon={<ClipboardList />}
                title={strings.empty.title}
                description={strings.empty.description}
            />
        )
    }

    if (dailyTickets.data.items.length === 0) {
        return (
            <EmptyState
                icon={<ClipboardList />}
                title={strings.pastEnd.title}
                description={strings.pastEnd.description}
                action={
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPage(1)
                        }}
                    >
                        {strings.pastEnd.action}
                    </Button>
                }
            />
        )
    }

    const range = pageRange(dailyTickets.data)

    return (
        <>
            <DailyTicketTable
                dailyTickets={dailyTickets.data.items}
                range={range}
                isUpdating={dailyTickets.isPlaceholderData}
                sort={sort}
                onSort={sortBy}
                page={page}
                onPageChange={setPage}
            />
            <Text hideBelow="md" hideFrom="lg" textStyle="sm" color="fg.muted">
                {strings.moreInDetail}
            </Text>
            <DailyTicketCards
                dailyTickets={dailyTickets.data.items}
                range={range}
                isUpdating={dailyTickets.isPlaceholderData}
                page={page}
                onPageChange={setPage}
            />
        </>
    )
}
