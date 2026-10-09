import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { request } from '@/shared/api'

import {
    inspectorListResponseSchema,
    inspectorResponseSchema,
    toInspector,
    toInspectorRequest,
    type Inspector,
    type InspectorInput,
} from '../validators/inspector'

const inspectorKeys = {
    list: ['inspectors', 'list'] as const,
}

const inspectorsQuery = queryOptions({
    queryKey: inspectorKeys.list,
    queryFn: async ({ signal }) => {
        const inspectors = await request('/inspectors', {
            schema: inspectorListResponseSchema,
            signal,
        })

        return inspectors.map(toInspector)
    },
})

export function useInspectors() {
    return useQuery(inspectorsQuery)
}

export function useCreateInspector() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: InspectorInput) =>
            toInspector(
                await request('/inspectors', {
                    method: 'POST',
                    body: toInspectorRequest(input),
                    schema: inspectorResponseSchema,
                }),
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: inspectorsQuery.queryKey }),
    })
}

export function useUpdateInspector() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...input }: Inspector & InspectorInput) =>
            toInspector(
                await request(`/inspectors/${String(id)}`, {
                    method: 'PUT',
                    body: toInspectorRequest(input),
                    schema: inspectorResponseSchema,
                }),
            ),
        onSuccess: (saved) => {
            queryClient.setQueryData(inspectorsQuery.queryKey, (inspectors) =>
                inspectors?.map((inspector) => (inspector.id === saved.id ? saved : inspector)),
            )
        },
    })
}
