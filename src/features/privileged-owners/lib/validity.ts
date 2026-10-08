import type { PrivilegedOwner } from '../validators/privilegedOwner'

export type Validity = 'valid' | 'expired'

// The same rule as the Inspector check: valid while ValidUntil >= now.
export function validityOf(owner: PrivilegedOwner, now: Date): Validity {
    return owner.validUntil.getTime() >= now.getTime() ? 'valid' : 'expired'
}
