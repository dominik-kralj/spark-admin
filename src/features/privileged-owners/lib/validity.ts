import type { PrivilegedOwner } from '../validators/privilegedOwner'

export type Validity = 'valid' | 'expired'

export type ValidityFilter = 'all' | Validity

export const validityFilters: readonly ValidityFilter[] = ['all', 'valid', 'expired']

export function readValidityFilter(value: string): ValidityFilter {
    return validityFilters.find((filter) => filter === value) ?? 'all'
}

export interface PrivilegedOwnerRow {
    owner: PrivilegedOwner
    validity: Validity
}

export function validityOf(owner: PrivilegedOwner, asOf: Date): Validity {
    return owner.validUntil.getTime() >= asOf.getTime() ? 'valid' : 'expired'
}

export function toRows(owners: PrivilegedOwner[], asOf: Date): PrivilegedOwnerRow[] {
    return owners.map((owner) => ({ owner, validity: validityOf(owner, asOf) }))
}
