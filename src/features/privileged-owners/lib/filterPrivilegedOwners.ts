import { normalisePlate } from '@/shared/lib/validation'

import type { PrivilegedOwnerRow, ValidityFilter } from './validity'

export function filterByPlate(rows: PrivilegedOwnerRow[], search: string): PrivilegedOwnerRow[] {
    const query = normalisePlate(search)

    return rows.filter(({ owner }) => owner.plate.includes(query))
}

export function filterByValidity(
    rows: PrivilegedOwnerRow[],
    filter: ValidityFilter,
): PrivilegedOwnerRow[] {
    return filter === 'all' ? rows : rows.filter(({ validity }) => validity === filter)
}

export function countByValidity(rows: PrivilegedOwnerRow[]): Record<ValidityFilter, number> {
    const valid = filterByValidity(rows, 'valid').length

    return { all: rows.length, valid, expired: rows.length - valid }
}
