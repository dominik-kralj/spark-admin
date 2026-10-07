import { z } from 'zod'

import { isApiError } from '@/shared/api'

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

export interface ZoneFieldError {
    field: ZoneField
    reason: 'duplicate' | 'invalid'
}

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

const fieldForRawName: Record<string, ZoneField> = {
    zoneCode: 'code',
    zoneName: 'name',
    price: 'price',
    dailyTicketPrice: 'dailyTicketPrice',
    durationMinutes: 'durationMinutes',
    maxExtensions: 'maxExtensions',
    dpkIssueDelayMinutes: 'dpkIssueDelayMinutes',
}

const duplicateBodySchema = z.object({ code: z.literal('duplicate'), field: z.string() })

const validationBodySchema = z.object({ errors: z.record(z.string(), z.unknown()) })

export function toZoneFieldErrors(error: unknown): ZoneFieldError[] {
    if (!isApiError(error)) return []

    if (error.kind === 'conflict') {
        const parsed = duplicateBodySchema.safeParse(error.body)
        const field = parsed.success ? fieldForRawName[parsed.data.field] : undefined

        return field === undefined ? [] : [{ field, reason: 'duplicate' }]
    }

    if (error.kind === 'validation') {
        const parsed = validationBodySchema.safeParse(error.body)
        if (!parsed.success) return []

        return Object.keys(parsed.data.errors).flatMap((rawName) => {
            const field = fieldForRawName[rawName]

            return field === undefined ? [] : [{ field, reason: 'invalid' as const }]
        })
    }

    return []
}
