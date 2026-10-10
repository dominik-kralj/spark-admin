import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { deleteRequest, request } from '@/shared/api'
import { startedByRouteLoader } from '@/shared/lib/queryClient'

import {
    adminUserListResponseSchema,
    adminUserResponseSchema,
    toAdminUser,
    toAdminUserCreateRequest,
    toAdminUserUpdateRequest,
    type AdminUserCreateInput,
    type AdminUserUpdateInput,
} from '../validators/adminUser'

const adminUserKeys = {
    list: ['adminUsers', 'list'] as const,
}

export const adminUsersQuery = queryOptions({
    queryKey: adminUserKeys.list,
    ...startedByRouteLoader,
    queryFn: async ({ signal }) => {
        const users = await request('/users', { schema: adminUserListResponseSchema, signal })

        return users.map(toAdminUser)
    },
})

export function useAdminUsers() {
    return useQuery(adminUsersQuery)
}

// A mutation keeps its variables, the password among them, until it is collected.
const forgetPassword = { gcTime: 0 }

export function useCreateAdminUser() {
    const queryClient = useQueryClient()

    return useMutation({
        ...forgetPassword,
        mutationFn: async (input: AdminUserCreateInput) =>
            toAdminUser(
                await request('/users', {
                    method: 'POST',
                    body: toAdminUserCreateRequest(input),
                    schema: adminUserResponseSchema,
                }),
            ),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersQuery.queryKey }),
    })
}

export function useUpdateAdminUser() {
    const queryClient = useQueryClient()

    return useMutation({
        ...forgetPassword,
        mutationFn: async ({ id, ...input }: AdminUserUpdateInput & { id: number }) =>
            toAdminUser(
                await request(`/users/${String(id)}`, {
                    method: 'PUT',
                    body: toAdminUserUpdateRequest(input),
                    schema: adminUserResponseSchema,
                }),
            ),
        onSuccess: (saved) => {
            queryClient.setQueryData(adminUsersQuery.queryKey, (users) =>
                users?.map((user) => (user.id === saved.id ? saved : user)),
            )
        },
    })
}

export function useDeleteAdminUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteRequest(`/users/${String(id)}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUsersQuery.queryKey }),
    })
}
