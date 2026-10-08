import type { Sort } from '@/shared/lib/useSortSearchParams'

import type { PrivilegedOwner } from '../validators/privilegedOwner'

export const privilegedOwnerSortKeys = ['plate', 'validUntil'] as const

export type PrivilegedOwnerSortKey = (typeof privilegedOwnerSortKeys)[number]

const plateCollator = new Intl.Collator('hr', { numeric: true, sensitivity: 'base' })

function byPlate(a: PrivilegedOwner, b: PrivilegedOwner): number {
    return plateCollator.compare(a.plate, b.plate)
}

function byValidUntil(a: PrivilegedOwner, b: PrivilegedOwner): number {
    return a.validUntil.getTime() - b.validUntil.getTime()
}

const compareBy = { plate: byPlate, validUntil: byValidUntil } as const

/** Entries with the same date stay in plate order whichever way the dates run. */
export function sortPrivilegedOwners(
    owners: PrivilegedOwner[],
    { key, direction }: Sort<PrivilegedOwnerSortKey>,
): PrivilegedOwner[] {
    const sign = direction === 'asc' ? 1 : -1

    return owners.toSorted((a, b) => sign * compareBy[key](a, b) || byPlate(a, b))
}
