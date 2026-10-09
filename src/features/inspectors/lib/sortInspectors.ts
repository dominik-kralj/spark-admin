import type { SortDirection } from '@/shared/lib/useSortSearchParams'

import type { Inspector } from '../validators/inspector'

// Croatian order, so Č comes after C and Š after S.
const nameCollator = new Intl.Collator('hr', { sensitivity: 'base' })

function compareBySurname(a: Inspector, b: Inspector): number {
    return nameCollator.compare(a.surname, b.surname) || nameCollator.compare(a.name, b.name)
}

export function sortInspectorsBySurname(
    inspectors: Inspector[],
    direction: SortDirection,
): Inspector[] {
    const sorted = inspectors.toSorted(compareBySurname)

    return direction === 'asc' ? sorted : sorted.reverse()
}
