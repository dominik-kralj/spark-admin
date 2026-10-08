import { z } from 'zod'

import { endOfZagrebDay } from '@/shared/lib/calendarDate'
import { formatDate } from '@/shared/lib/format'
import { dateField, plateField, requiredText } from '@/shared/lib/validation'

import type { PrivilegedOwner, PrivilegedOwnerInput } from './privilegedOwner'

export const textMaxLength = {
    ownerName: 200,
    street: 150,
    houseNo: 20,
    zipCode: 10,
    city: 100,
} as const

export type PrivilegedOwnerTextField = keyof typeof textMaxLength

const textField = (field: PrivilegedOwnerTextField) => requiredText(textMaxLength[field])

export const privilegedOwnerFormSchema = z.object({
    plate: plateField,
    validUntil: dateField,
    ownerName: textField('ownerName'),
    street: textField('street'),
    houseNo: textField('houseNo'),
    zipCode: textField('zipCode'),
    city: textField('city'),
})

export type PrivilegedOwnerFormValues = z.input<typeof privilegedOwnerFormSchema>

export type ValidPrivilegedOwnerFormValues = z.output<typeof privilegedOwnerFormSchema>

export const emptyPrivilegedOwnerForm: PrivilegedOwnerFormValues = {
    plate: '',
    validUntil: '',
    ownerName: '',
    street: '',
    houseNo: '',
    zipCode: '',
    city: '',
}

/** The form collects a day; the privilege holds to the end of that day in Zagreb. */
export function toPrivilegedOwnerInput(
    values: ValidPrivilegedOwnerFormValues,
): PrivilegedOwnerInput {
    return {
        plate: values.plate,
        validUntil: endOfZagrebDay(values.validUntil),
        ownerName: values.ownerName,
        address: {
            street: values.street,
            houseNo: values.houseNo,
            zipCode: values.zipCode,
            city: values.city,
        },
    }
}

export function toPrivilegedOwnerFormValues(owner: PrivilegedOwner): PrivilegedOwnerFormValues {
    return {
        plate: owner.plate,
        validUntil: formatDate(owner.validUntil),
        ownerName: owner.ownerName,
        ...owner.address,
    }
}
