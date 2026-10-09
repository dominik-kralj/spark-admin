import { z } from 'zod'

/** Only what the zone filter needs from `GET /zones`. */
export const zoneOptionsResponseSchema = z.array(
    z.object({ zoneId: z.number(), zoneCode: z.string() }),
)

export interface ZoneOption {
    id: number
    code: string
}

export function toZoneOptions(raw: z.output<typeof zoneOptionsResponseSchema>): ZoneOption[] {
    return raw
        .map(({ zoneId, zoneCode }) => ({ id: zoneId, code: zoneCode }))
        .toSorted((a, b) => a.code.localeCompare(b.code, 'hr'))
}
