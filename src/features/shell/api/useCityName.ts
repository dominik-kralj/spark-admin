import { useQuery } from '@tanstack/react-query'

import { request } from '@/shared/api'

import { tenantResponseSchema, toCityName } from '../validators/tenant'

const tenantKeys = {
    all: ['tenant'] as const,
}

export function useCityName() {
    return useQuery({
        queryKey: tenantKeys.all,
        queryFn: async ({ signal }) =>
            toCityName(await request('/tenant', { schema: tenantResponseSchema, signal })),
        staleTime: Infinity,
    })
}
