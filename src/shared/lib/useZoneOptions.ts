import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { request } from '@/shared/api'

const zoneOptionsResponseSchema = z.array(z.object({ zoneId: z.number(), zoneCode: z.string() }))

export interface ZoneOption {
    id: number
    code: string
}

export function toZoneOptions(raw: z.output<typeof zoneOptionsResponseSchema>): ZoneOption[] {
    return raw
        .map(({ zoneId, zoneCode }) => ({ id: zoneId, code: zoneCode }))
        .toSorted((a, b) => a.code.localeCompare(b.code, 'hr'))
}

const zoneOptionsQuery = queryOptions({
    queryKey: ['zoneOptions'],
    // Zones change rarely; without this every mount of a filter asks again.
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) =>
        toZoneOptions(await request('/zones', { schema: zoneOptionsResponseSchema, signal })),
})

/** The city's zones for a zone filter, by code: `GET /zones`, which Zone also reads in full. */
export function useZoneOptions() {
    return useQuery(zoneOptionsQuery)
}
