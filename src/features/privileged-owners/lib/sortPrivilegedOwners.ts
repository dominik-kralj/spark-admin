import type { Sort } from '@/shared/lib/useSortSearchParams'

import type { PrivilegedOwnerRow } from './validity'

export const privilegedOwnerSortKeys = ['plate', 'validUntil'] as const

export type PrivilegedOwnerSortKey = (typeof privilegedOwnerSortKeys)[number]

const plateCollator = new Intl.Collator('hr', { numeric: true, sensitivity: 'base' })

function byPlate(a: PrivilegedOwnerRow, b: PrivilegedOwnerRow): number {
    return plateCollator.compare(a.owner.plate, b.owner.plate)
}

function byValidUntil(a: PrivilegedOwnerRow, b: PrivilegedOwnerRow): number {
    return a.owner.validUntil.getTime() - b.owner.validUntil.getTime()
}

const compareBy = { plate: byPlate, validUntil: byValidUntil } as const

export function sortPrivilegedOwners(
    rows: PrivilegedOwnerRow[],
    { key, direction }: Sort<PrivilegedOwnerSortKey>,
): PrivilegedOwnerRow[] {
    const sign = direction === 'asc' ? 1 : -1

    return rows.toSorted((a, b) => sign * compareBy[key](a, b) || byPlate(a, b))
}
