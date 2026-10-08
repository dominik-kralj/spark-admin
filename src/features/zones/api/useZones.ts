import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteRequest, request } from '@/shared/api'

import {
    toZone,
    toZoneRequest,
    zoneListResponseSchema,
    zoneResponseSchema,
    type Zone,
    type ZoneInput,
} from '../validators/zone'

const zoneKeys = {
    list: ['zones', 'list'] as const,
}

const zonesQuery = queryOptions({
    queryKey: zoneKeys.list,
    queryFn: async ({ signal }) => {
        const zones = await request('/zones', { schema: zoneListResponseSchema, signal })

        return zones.map(toZone)
    },
})

export function useZones() {
    return useQuery(zonesQuery)
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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: zonesQuery.queryKey }),
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
            queryClient.setQueryData(zonesQuery.queryKey, (zones) =>
                zones?.map((zone) => (zone.id === saved.id ? saved : zone)),
            )
        },
    })
}

export function useDeleteZone() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteRequest(`/zones/${String(id)}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: zonesQuery.queryKey }),
    })
}
