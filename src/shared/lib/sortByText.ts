import type { SortDirection } from './useSortSearchParams'

// Croatian order, so Č comes after C and Š after S; base, so case does not split equal text.
const textCollator = new Intl.Collator('hr', { sensitivity: 'base' })
// Numeric, so ZONA2 comes before ZONA10.
const numericCollator = new Intl.Collator('hr', { numeric: true, sensitivity: 'base' })

interface SortByTextOptions<T> {
    /** The texts to sort by, in order: each one breaks a tie in the one before. */
    keysOf: (item: T) => readonly string[]
    direction: SortDirection
    numeric?: boolean
}

/** A sorted copy of `items`, in Croatian text order. */
export function sortByText<T>(
    items: readonly T[],
    { keysOf, direction, numeric = false }: SortByTextOptions<T>,
): T[] {
    const collator = numeric ? numericCollator : textCollator
    const sorted = items.toSorted((a, b) => {
        const right = keysOf(b)

        return keysOf(a).reduce(
            (order, key, index) => order || collator.compare(key, right[index] ?? ''),
            0,
        )
    })

    return direction === 'asc' ? sorted : sorted.reverse()
}
