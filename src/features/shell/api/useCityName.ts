import { useQuery } from '@tanstack/react-query'

import { request } from '@/shared/api'

import { tenantResponseSchema, toCityName } from '../validators/tenant'

// Under the tenant prefix, so invalidating ['tenant'] after a settings save refreshes it too.
const tenantKeys = {
    name: ['tenant', 'name'] as const,
}

export function useCityName() {
    return useQuery({
        queryKey: tenantKeys.name,
        queryFn: async ({ signal }) =>
            toCityName(await request('/tenant', { schema: tenantResponseSchema, signal })),
        staleTime: Infinity,
    })
}
