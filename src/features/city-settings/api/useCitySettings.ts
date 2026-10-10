import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { request } from '@/shared/api'
import { tenantKeys } from '@/shared/lib/tenantKeys'
import { startedByRouteLoader } from '@/shared/lib/queryClient'

import {
    citySettingsResponseSchema,
    toCitySettings,
    toCitySettingsRequest,
    type CitySettings,
} from '../validators/citySettings'

export const citySettingsQuery = queryOptions({
    queryKey: tenantKeys.settings,
    ...startedByRouteLoader,
    queryFn: async ({ signal }) =>
        toCitySettings(await request('/tenant', { schema: citySettingsResponseSchema, signal })),
})

export function useCitySettings() {
    return useQuery(citySettingsQuery)
}

export function useUpdateCitySettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (settings: CitySettings) =>
            toCitySettings(
                await request('/tenant', {
                    method: 'PUT',
                    body: toCitySettingsRequest(settings),
                    schema: citySettingsResponseSchema,
                }),
            ),
        onSuccess: async (saved) => {
            queryClient.setQueryData(tenantKeys.settings, saved)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: tenantKeys.name }),
                queryClient.invalidateQueries({ queryKey: tenantKeys.reportRecipient }),
            ])
        },
    })
}
