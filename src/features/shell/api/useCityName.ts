import { useQuery } from '@tanstack/react-query'

import { request } from '@/shared/api'
import { tenantKeys } from '@/shared/lib/tenantKeys'

import { tenantResponseSchema, toCityName } from '../validators/tenant'

export function useCityName() {
    return useQuery({
        queryKey: tenantKeys.name,
        queryFn: async ({ signal }) =>
            toCityName(await request('/tenant', { schema: tenantResponseSchema, signal })),
        staleTime: Infinity,
    })
}
