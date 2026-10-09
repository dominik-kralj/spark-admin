import { pageParam } from '@/shared/lib/usePageSearchParam'
import { useSearchParams } from '@/shared/lib/useSearchParams'

import {
    noFilterValues,
    readFilterValues,
    toFilterSearchParams,
    type TicketFilterValues,
} from './ticketFilterValues'

/** The Karte filters, kept in the URL; every change starts again from the first page. */
export function useTicketFilters() {
    const { searchParams, updateSearchParams } = useSearchParams()
    const values = readFilterValues(searchParams)

    function apply(next: TicketFilterValues): void {
        updateSearchParams({ [pageParam]: null, ...toFilterSearchParams(next) })
    }

    function clear(): void {
        apply(noFilterValues)
    }

    return { values, apply, clear }
}
