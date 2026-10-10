import { useSearchParams } from './useSearchParams'

export const pageParam = 'page'

/** The page in the URL; anything but a whole number from 1 up reads as page 1. */
export function readPage(searchParams: URLSearchParams): number {
    const page = Number(searchParams.get(pageParam))

    return Number.isInteger(page) && page >= 1 ? page : 1
}

/** A paged list's page, kept in the URL; page 1 leaves the URL clean. */
export function usePageSearchParam() {
    const { searchParams, updateSearchParams } = useSearchParams()

    function setPage(page: number): void {
        updateSearchParams({ [pageParam]: page === 1 ? null : String(page) })
    }

    return { page: readPage(searchParams), setPage }
}
