import type { Address } from '../validators/privilegedOwner'

export function formatAddress({ street, houseNo, zipCode, city }: Address): string {
    return `${street} ${houseNo}, ${zipCode} ${city}`
}
