import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { request } from '@/shared/api'

import {
    privilegedOwnerListResponseSchema,
    privilegedOwnerResponseSchema,
    toPrivilegedOwner,
    toPrivilegedOwnerRequest,
    type PrivilegedOwner,
    type PrivilegedOwnerInput,
} from '../validators/privilegedOwner'

const privilegedOwnerKeys = {
    list: ['privilegedOwners', 'list'] as const,
}

const privilegedOwnersQuery = queryOptions({
    queryKey: privilegedOwnerKeys.list,
    queryFn: async ({ signal }) => {
        const owners = await request('/privileged-owners', {
            schema: privilegedOwnerListResponseSchema,
            signal,
        })

        return owners.map(toPrivilegedOwner)
    },
})

export function usePrivilegedOwners() {
    return useQuery(privilegedOwnersQuery)
}

export function useCreatePrivilegedOwner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: PrivilegedOwnerInput) =>
            toPrivilegedOwner(
                await request('/privileged-owners', {
                    method: 'POST',
                    body: toPrivilegedOwnerRequest(input),
                    schema: privilegedOwnerResponseSchema,
                }),
            ),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: privilegedOwnersQuery.queryKey }),
    })
}

export function useUpdatePrivilegedOwner() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, ...input }: PrivilegedOwner) =>
            toPrivilegedOwner(
                await request(`/privileged-owners/${String(id)}`, {
                    method: 'PUT',
                    body: toPrivilegedOwnerRequest(input),
                    schema: privilegedOwnerResponseSchema,
                }),
            ),
        onSuccess: (saved) => {
            queryClient.setQueryData(privilegedOwnersQuery.queryKey, (owners) =>
                owners?.map((owner) => (owner.id === saved.id ? saved : owner)),
            )
        },
    })
}
