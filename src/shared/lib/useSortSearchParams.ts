import { useSearchParams } from 'react-router'

export type SortDirection = 'asc' | 'desc'

export interface Sort<TKey extends string> {
    key: TKey
    direction: SortDirection
}

const sortParam = 'sort'
const directionParam = 'dir'

function readSort<TKey extends string>(
    searchParams: URLSearchParams,
    { keys, defaultSort }: { keys: readonly TKey[]; defaultSort: Sort<TKey> },
): Sort<TKey> {
    const key = keys.find((candidate) => candidate === searchParams.get(sortParam))
    const direction = searchParams.get(directionParam)
    const isDirection = direction === 'asc' || direction === 'desc'

    return {
        key: key ?? defaultSort.key,
        direction: isDirection ? direction : defaultSort.direction,
    }
}

/** The list's sort order, kept in the URL; the default order leaves the URL clean. */
export function useSortSearchParams<TKey extends string>(
    keys: readonly TKey[],
    defaultSort: Sort<TKey>,
) {
    const [searchParams, setSearchParams] = useSearchParams()
    const sort = readSort(searchParams, { keys, defaultSort })

    function sortBy(key: TKey): void {
        const direction = key === sort.key && sort.direction === 'asc' ? 'desc' : 'asc'
        const isDefault = key === defaultSort.key && direction === defaultSort.direction

        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current)
                next.delete(sortParam)
                next.delete(directionParam)
                if (!isDefault) {
                    next.set(sortParam, key)
                    next.set(directionParam, direction)
                }

                return next
            },
            { replace: true },
        )
    }

    return { sort, sortBy }
}
