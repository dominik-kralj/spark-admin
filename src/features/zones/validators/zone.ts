import { z } from 'zod'

import { fieldErrorsFrom, type ServerFieldError } from '@/shared/api'

export const zoneResponseSchema = z.object({
    zoneId: z.number(),
    zoneCode: z.string(),
    zoneName: z.string(),
    price: z.number(),
    dailyTicketPrice: z.number(),
    durationMinutes: z.number(),
    maxExtensions: z.number(),
    dpkIssueDelayMinutes: z.number(),
})

export const zoneListResponseSchema = z.array(zoneResponseSchema)

type ZoneResponse = z.output<typeof zoneResponseSchema>

type ZoneRequest = Omit<ZoneResponse, 'zoneId'>

export interface Zone {
    id: number
    code: string
    name: string
    price: number
    dailyTicketPrice: number
    durationMinutes: number
    maxExtensions: number
    dpkIssueDelayMinutes: number
}

export type ZoneInput = Omit<Zone, 'id'>

export type ZoneField = keyof ZoneInput

export function toZone(raw: ZoneResponse): Zone {
    return {
        id: raw.zoneId,
        code: raw.zoneCode,
        name: raw.zoneName,
        price: raw.price,
        dailyTicketPrice: raw.dailyTicketPrice,
        durationMinutes: raw.durationMinutes,
        maxExtensions: raw.maxExtensions,
        dpkIssueDelayMinutes: raw.dpkIssueDelayMinutes,
    }
}

export function toZoneRequest(input: ZoneInput): ZoneRequest {
    return {
        zoneCode: input.code,
        zoneName: input.name,
        price: input.price,
        dailyTicketPrice: input.dailyTicketPrice,
        durationMinutes: input.durationMinutes,
        maxExtensions: input.maxExtensions,
        dpkIssueDelayMinutes: input.dpkIssueDelayMinutes,
    }
}

// In form order, so the first error is the first field on screen.
const zoneFieldForRawName: Record<keyof ZoneRequest, ZoneField> = {
    zoneCode: 'code',
    zoneName: 'name',
    price: 'price',
    dailyTicketPrice: 'dailyTicketPrice',
    durationMinutes: 'durationMinutes',
    maxExtensions: 'maxExtensions',
    dpkIssueDelayMinutes: 'dpkIssueDelayMinutes',
}

export function toZoneFieldErrors(error: unknown): Partial<Record<ZoneField, ServerFieldError>> {
    return fieldErrorsFrom(error, zoneFieldForRawName)
}
