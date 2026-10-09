import { useSearchParams } from './useSearchParams'

export type SortDirection = 'asc' | 'desc'

export interface Sort<TKey extends string> {
    key: TKey
    direction: SortDirection
}

const sortParam = 'sort'
const directionParam = 'dir'

/** The params that hold a sort; removing them goes back to the list's default order. */
export const sortParams = [sortParam, directionParam] as const

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

/** The list's sort order in the URL (default leaves it clean); a new order clears `resetParams`. */
export function useSortSearchParams<TKey extends string>(
    keys: readonly TKey[],
    defaultSort: Sort<TKey>,
    resetParams: readonly string[] = [],
) {
    const { searchParams, updateSearchParams } = useSearchParams()
    const sort = readSort(searchParams, { keys, defaultSort })

    function sortBy(key: TKey): void {
        const direction = key === sort.key && sort.direction === 'asc' ? 'desc' : 'asc'
        const isDefault = key === defaultSort.key && direction === defaultSort.direction

        updateSearchParams({
            ...Object.fromEntries(resetParams.map((name) => [name, null])),
            [sortParam]: isDefault ? null : key,
            [directionParam]: isDefault ? null : direction,
        })
    }

    return { sort, sortBy }
}
