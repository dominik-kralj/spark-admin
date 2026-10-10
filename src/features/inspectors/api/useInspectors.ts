import {
    queryOptions,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

import { deleteRequest, request } from '@/shared/api'
import { startedByRouteLoader } from '@/shared/lib/queryClient'

import {
    inspectorDetailResponseSchema,
    inspectorListResponseSchema,
    inspectorResponseSchema,
    toInspector,
    toInspectorDetail,
    toInspectorRequest,
    type InspectorInput,
} from '../validators/inspector'

const inspectorKeys = {
    list: ['inspectors', 'list'] as const,
    detail: (id: number | null) => ['inspectors', 'detail', id] as const,
}

export const inspectorsQuery = queryOptions({
    queryKey: inspectorKeys.list,
    ...startedByRouteLoader,
    queryFn: async ({ signal }) => {
        const inspectors = await request('/inspectors', {
            schema: inspectorListResponseSchema,
            signal,
        })

        return inspectors.map(toInspector)
    },
})

function inspectorQuery(id: number | null) {
    return queryOptions({
        queryKey: inspectorKeys.detail(id),
        queryFn:
            id === null
                ? skipToken
                : async ({ signal }) =>
                      toInspectorDetail(
                          await request(`/inspectors/${String(id)}`, {
                              schema: inspectorDetailResponseSchema,
                              signal,
                          }),
                      ),
    })
}

export function useInspectors() {
    return useQuery(inspectorsQuery)
}

/** One inspector with the PIN, which the list never carries; idle while `id` is null. */
export function useInspector(id: number | null) {
    return useQuery(inspectorQuery(id))
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
        mutationFn: async ({ id, ...input }: InspectorInput & { id: number }) =>
            toInspector(
                await request(`/inspectors/${String(id)}`, {
                    method: 'PUT',
                    body: toInspectorRequest(input),
                    schema: inspectorResponseSchema,
                }),
            ),
        onSuccess: async (saved) => {
            queryClient.setQueryData(inspectorsQuery.queryKey, (inspectors) =>
                inspectors?.map((inspector) => (inspector.id === saved.id ? saved : inspector)),
            )
            await queryClient.invalidateQueries({ queryKey: inspectorKeys.detail(saved.id) })
        },
    })
}

export function useDeleteInspector() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteRequest(`/inspectors/${String(id)}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: inspectorsQuery.queryKey }),
    })
}
