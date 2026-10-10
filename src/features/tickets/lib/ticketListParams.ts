import { readFilterValues, toTicketFilters } from '@/shared/lib/ticketFilterValues'
import { readPage } from '@/shared/lib/usePageSearchParam'
import { readSort, type Sort } from '@/shared/lib/useSortSearchParams'

import type { TicketListParams, TicketSortKey } from '../validators/ticket'

export const ticketSortKeys = ['createdAt', 'plate', 'amount', 'validUntil'] as const

export const defaultTicketSort: Sort<TicketSortKey> = { key: 'createdAt', direction: 'desc' }

export const ticketPageSize = 25

/** The page, order and filters in the URL: what the list asks for, and what its loader starts. */
export function readTicketListParams(searchParams: URLSearchParams): TicketListParams {
    return {
        page: readPage(searchParams),
        pageSize: ticketPageSize,
        sort: readSort(searchParams, { keys: ticketSortKeys, defaultSort: defaultTicketSort }),
        filters: toTicketFilters(readFilterValues(searchParams)),
    }
}
