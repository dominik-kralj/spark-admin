import type { Validity } from './validity'

export function expiredTint(validity: Validity): string | undefined {
    return validity === 'expired' ? 'bg.subtle' : undefined
}
