import { z } from 'zod'

import { ibanField, messageKey, oibField, requiredText } from '@/shared/lib/validation'

import type { CitySettings } from './citySettings'

export type CitySettingsValidationMessage = 'cashRegisterInvalid' | 'vatRateInvalid'

const message = messageKey<CitySettingsValidationMessage>

export const textMaxLength = {
    name: 100,
    street: 150,
    houseNo: 20,
    zipCode: 10,
    city: 100,
    premisesCode: 25,
    cashRegisterCode: 15,
} as const

const textField = (field: keyof typeof textMaxLength) => requiredText(textMaxLength[field])

// CK_CITY_TENANTS_CashRegisterCode: digits only, not starting with 0.
const cashRegisterCodeField = textField('cashRegisterCode').regex(
    /^([1-9]\d*)?$/,
    message('cashRegisterInvalid'),
)

const maxVatRate = 100

// A percent with up to two decimals (decimal(18,2)), written with a comma or a dot.
const vatRateField = z
    .string()
    .trim()
    .min(1, messageKey('required'))
    .regex(/^(\d{1,3}([.,]\d{1,2})?)?$/, message('vatRateInvalid'))
    .transform((value) => Number(value.replace(',', '.')))
    .pipe(z.number().max(maxVatRate, message('vatRateInvalid')))

export const citySettingsFormSchema = z.object({
    name: textField('name'),
    oib: oibField,
    street: textField('street'),
    houseNo: textField('houseNo'),
    zipCode: textField('zipCode'),
    city: textField('city'),
    iban: ibanField,
    premisesCode: textField('premisesCode'),
    cashRegisterCode: cashRegisterCodeField,
    vatRate: vatRateField,
})

export type CitySettingsFormValues = z.input<typeof citySettingsFormSchema>

export function toCitySettingsFormValues(settings: CitySettings): CitySettingsFormValues {
    return { ...settings, vatRate: String(settings.vatRate).replace('.', ',') }
}
