import type { SortDirection } from '@/shared/lib/useSortSearchParams'

import type { Zone } from '../validators/zone'

// Numeric, so ZONA2 comes before ZONA10; base, so case does not split equal codes.
const codeCollator = new Intl.Collator('hr', { numeric: true, sensitivity: 'base' })

export function sortZonesByCode(zones: Zone[], direction: SortDirection): Zone[] {
    const sorted = zones.toSorted((a, b) => codeCollator.compare(a.code, b.code))

    return direction === 'asc' ? sorted : sorted.reverse()
}
