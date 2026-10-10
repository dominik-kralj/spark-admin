import { z } from 'zod'

import { fieldErrorsFrom, type ServerFieldError } from '@/shared/api'

// reportEmail is read-only and belongs to Izvještaji, so the schema drops it.
export const citySettingsResponseSchema = z.object({
    tenantName: z.string(),
    vatID: z.string(),
    address: z.string(),
    houseNo: z.string(),
    zipCode: z.string(),
    city: z.string(),
    iban: z.string(),
    premisesCode: z.string(),
    cashRegisterCode: z.string(),
    stopaPDV: z.number(),
})

type CitySettingsResponse = z.output<typeof citySettingsResponseSchema>

type CitySettingsRequest = CitySettingsResponse

export interface CitySettings {
    name: string
    oib: string
    street: string
    houseNo: string
    zipCode: string
    city: string
    iban: string
    premisesCode: string
    cashRegisterCode: string
    vatRate: number
}

export type CitySettingsField = keyof CitySettings

export function toCitySettings(raw: CitySettingsResponse): CitySettings {
    return {
        name: raw.tenantName,
        oib: raw.vatID,
        street: raw.address,
        houseNo: raw.houseNo,
        zipCode: raw.zipCode,
        city: raw.city,
        iban: raw.iban,
        premisesCode: raw.premisesCode,
        cashRegisterCode: raw.cashRegisterCode,
        vatRate: raw.stopaPDV,
    }
}

export function toCitySettingsRequest(settings: CitySettings): CitySettingsRequest {
    return {
        tenantName: settings.name,
        vatID: settings.oib,
        address: settings.street,
        houseNo: settings.houseNo,
        zipCode: settings.zipCode,
        city: settings.city,
        iban: settings.iban,
        premisesCode: settings.premisesCode,
        cashRegisterCode: settings.cashRegisterCode,
        stopaPDV: settings.vatRate,
    }
}

// In form order, so the first error is the first field on screen.
const citySettingsFieldForRawName: Record<keyof CitySettingsRequest, CitySettingsField> = {
    tenantName: 'name',
    vatID: 'oib',
    address: 'street',
    houseNo: 'houseNo',
    zipCode: 'zipCode',
    city: 'city',
    iban: 'iban',
    premisesCode: 'premisesCode',
    cashRegisterCode: 'cashRegisterCode',
    stopaPDV: 'vatRate',
}

export function toCitySettingsFieldErrors(
    error: unknown,
): Partial<Record<CitySettingsField, ServerFieldError>> {
    return fieldErrorsFrom(error, citySettingsFieldForRawName)
}
