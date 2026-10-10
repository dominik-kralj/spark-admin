import type { SortDirection } from './useSortSearchParams'

// Croatian order, so Č comes after C and Š after S; base, so case does not split equal text.
const textCollator = new Intl.Collator('hr', { sensitivity: 'base' })
// Numeric, so ZONA2 comes before ZONA10.
const numericCollator = new Intl.Collator('hr', { numeric: true, sensitivity: 'base' })

/** A sorted copy, by the texts `textsOf` gives each item; each text breaks a tie in the one before. */
export function sortByText<T>(
    items: readonly T[],
    textsOf: (item: T) => readonly string[],
    direction: SortDirection,
    { numeric = false }: { numeric?: boolean } = {},
): T[] {
    const collator = numeric ? numericCollator : textCollator
    const sorted = items.toSorted((a, b) => {
        const left = textsOf(a)
        const right = textsOf(b)

        return left.reduce(
            (order, text, index) => order || collator.compare(text, right[index] ?? ''),
            0,
        )
    })

    return direction === 'asc' ? sorted : sorted.reverse()
}
