import { readFilterValues, toTicketFilters } from '@/shared/lib/ticketFilterValues'
import { readPage } from '@/shared/lib/usePageSearchParam'
import { readSort, type Sort } from '@/shared/lib/useSortSearchParams'

import type { DailyTicketListParams, DailyTicketSortKey } from '../validators/dailyTicket'

export const dailyTicketSortKeys = ['createdAt', 'plate', 'inspector'] as const

export const defaultDailyTicketSort: Sort<DailyTicketSortKey> = {
    key: 'createdAt',
    direction: 'desc',
}

const dailyTicketPageSize = 25

/** The page, order and filters in the URL: what the list asks for, and what its loader starts. */
export function readDailyTicketListParams(searchParams: URLSearchParams): DailyTicketListParams {
    return {
        page: readPage(searchParams),
        pageSize: dailyTicketPageSize,
        sort: readSort(searchParams, {
            keys: dailyTicketSortKeys,
            defaultSort: defaultDailyTicketSort,
        }),
        filters: toTicketFilters(readFilterValues(searchParams)),
    }
}
