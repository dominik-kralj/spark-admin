import { normalisePlate } from '@/shared/lib/validation'

import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { validityOf, type Validity } from './validity'

/** Matches anywhere in the plate, however the search was typed (zg 12 finds ZG1234AB). */
export function matchingPlate(owners: PrivilegedOwner[], search: string): PrivilegedOwner[] {
    const query = normalisePlate(search)

    return owners.filter((owner) => owner.plate.includes(query))
}

export function countByValidity(owners: PrivilegedOwner[], now: Date): Record<Validity, number> {
    const valid = owners.filter((owner) => validityOf(owner, now) === 'valid').length

    return { valid, expired: owners.length - valid }
}
