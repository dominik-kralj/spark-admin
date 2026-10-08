import { z } from 'zod'

import { fieldErrorsFrom, type ServerFieldError } from '@/shared/api'

export const privilegedOwnerResponseSchema = z.object({
    privilegedOwnerId: z.number(),
    vehicleRegistration: z.string(),
    validUntil: z.iso.datetime({ offset: true }),
    ownerName: z.string(),
    address: z.string(),
    houseNo: z.string(),
    zipCode: z.string(),
    city: z.string(),
})

export const privilegedOwnerListResponseSchema = z.array(privilegedOwnerResponseSchema)

type PrivilegedOwnerResponse = z.output<typeof privilegedOwnerResponseSchema>

type PrivilegedOwnerRequest = Omit<PrivilegedOwnerResponse, 'privilegedOwnerId'>

export interface Address {
    street: string
    houseNo: string
    zipCode: string
    city: string
}

export interface PrivilegedOwner {
    id: number
    plate: string
    /** The last instant the privilege holds: the end of the chosen day in Zagreb. */
    validUntil: Date
    ownerName: string
    address: Address
}

export type PrivilegedOwnerInput = Omit<PrivilegedOwner, 'id'>

export type PrivilegedOwnerField = 'plate' | 'validUntil' | 'ownerName' | keyof Address

export function toPrivilegedOwner(raw: PrivilegedOwnerResponse): PrivilegedOwner {
    return {
        id: raw.privilegedOwnerId,
        plate: raw.vehicleRegistration,
        validUntil: new Date(raw.validUntil),
        ownerName: raw.ownerName,
        address: {
            street: raw.address,
            houseNo: raw.houseNo,
            zipCode: raw.zipCode,
            city: raw.city,
        },
    }
}

export function toPrivilegedOwnerRequest(input: PrivilegedOwnerInput): PrivilegedOwnerRequest {
    return {
        vehicleRegistration: input.plate,
        validUntil: input.validUntil.toISOString(),
        ownerName: input.ownerName,
        address: input.address.street,
        houseNo: input.address.houseNo,
        zipCode: input.address.zipCode,
        city: input.address.city,
    }
}

// In form order, so the first error is the first field on screen.
const privilegedOwnerFieldForRawName: Record<keyof PrivilegedOwnerRequest, PrivilegedOwnerField> = {
    vehicleRegistration: 'plate',
    validUntil: 'validUntil',
    ownerName: 'ownerName',
    address: 'street',
    houseNo: 'houseNo',
    zipCode: 'zipCode',
    city: 'city',
}

export function toPrivilegedOwnerFieldErrors(
    error: unknown,
): Partial<Record<PrivilegedOwnerField, ServerFieldError>> {
    return fieldErrorsFrom(error, privilegedOwnerFieldForRawName)
}
