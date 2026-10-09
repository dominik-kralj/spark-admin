import { useSearchParams } from './useSearchParams'

export const pageParam = 'page'

function parsePage(value: string | null): number {
    const page = Number(value)

    return Number.isInteger(page) && page >= 1 ? page : 1
}

/** A paged list's page, kept in the URL; page 1 leaves the URL clean. */
export function usePageSearchParam() {
    const { searchParams, updateSearchParams } = useSearchParams()

    function setPage(page: number): void {
        updateSearchParams({ [pageParam]: page === 1 ? null : String(page) })
    }

    return { page: parsePage(searchParams.get(pageParam)), setPage }
}
