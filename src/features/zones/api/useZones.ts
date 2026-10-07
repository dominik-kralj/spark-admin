import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { request } from '@/shared/api'

import {
    toZone,
    toZoneRequest,
    zoneListResponseSchema,
    zoneResponseSchema,
    type Zone,
    type ZoneInput,
} from '../validators/zone'

export const zoneKeys = {
    all: ['zones'] as const,
    list: () => [...zoneKeys.all, 'list'] as const,
}

export function zonesQueryOptions() {
    return queryOptions({
        queryKey: zoneKeys.list(),
        queryFn: async ({ signal }) => {
            const zones = await request('/zones', { schema: zoneListResponseSchema, signal })

            return zones.map(toZone)
        },
    })
}

export function useZones() {
    return useQuery(zonesQueryOptions())
}

export function useCreateZone() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: ZoneInput) =>
            toZone(
                await request('/zones', {
                    method: 'POST',
                    body: toZoneRequest(input),
                    schema: zoneResponseSchema,
                }),
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: zoneKeys.list() }),
    })
}

export function useUpdateZone() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...input }: Zone) =>
            toZone(
                await request(`/zones/${String(id)}`, {
                    method: 'PUT',
                    body: toZoneRequest(input),
                    schema: zoneResponseSchema,
                }),
            ),
        onSuccess: (saved) => {
            queryClient.setQueryData(zonesQueryOptions().queryKey, (zones) =>
                zones?.map((zone) => (zone.id === saved.id ? saved : zone)),
            )
        },
    })
}

export function useDeleteZone() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) =>
            request(`/zones/${String(id)}`, { method: 'DELETE', schema: z.undefined() }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: zoneKeys.list() }),
    })
}
