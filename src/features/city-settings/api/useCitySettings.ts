import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { request } from '@/shared/api'
import { tenantKeys } from '@/shared/lib/tenantKeys'

import {
    citySettingsResponseSchema,
    toCitySettings,
    toCitySettingsRequest,
    type CitySettings,
} from '../validators/citySettings'

export function useCitySettings() {
    return useQuery({
        queryKey: tenantKeys.settings,
        queryFn: async ({ signal }) =>
            toCitySettings(
                await request('/tenant', { schema: citySettingsResponseSchema, signal }),
            ),
    })
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
            await queryClient.invalidateQueries({ queryKey: tenantKeys.name })
        },
    })
}
