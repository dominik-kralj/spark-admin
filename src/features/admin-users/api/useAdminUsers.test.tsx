import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { renderHookWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import {
    useAdminUsers,
    useCreateAdminUser,
    useDeleteAdminUser,
    useUpdateAdminUser,
} from './useAdminUsers'
import { toAdminUserFieldErrors, type AdminUser } from '../validators/adminUser'

const seedUsers: AdminUser[] = [
    { id: 1, username: 'admin', name: 'Ana', surname: 'Kovač' },
    { id: 2, username: 'marin.loncar', name: 'Marin', surname: 'Lončar' },
    { id: 3, username: 'sanja.klaric', name: 'Sanja', surname: 'Klarić' },
]

const otherCityUsername = 'ivan.maric'

function renderAdminUserHooks() {
    signInForTest()

    return renderHookWithQueryClient(() => ({
        users: useAdminUsers(),
        create: useCreateAdminUser(),
        update: useUpdateAdminUser(),
        remove: useDeleteAdminUser(),
    }))
}

type AdminUserHooks = ReturnType<typeof renderAdminUserHooks>['result']

async function loadedUsers(result: AdminUserHooks): Promise<AdminUser[]> {
    await waitFor(() => {
        expect(result.current.users.isSuccess).toBe(true)
    })

    return result.current.users.data ?? []
}

async function mutationError(run: () => Promise<unknown>): Promise<unknown> {
    let error: unknown
    await act(async () => {
        await run().catch((caught: unknown) => {
            error = caught
        })
    })

    return error
}

/** Every raw body the mock answers /users with, to check none carries a password. */
function captureResponses(): unknown[] {
    const bodies: unknown[] = []
    server.events.on('response:mocked', async ({ request, response }) => {
        if (new URL(request.url).pathname.includes('/users')) {
            bodies.push(await response.clone().json())
        }
    })

    return bodies
}

describe('useAdminUsers', () => {
    it("lists the city's users, mapped to the domain", async () => {
        const { result } = renderAdminUserHooks()

        expect(await loadedUsers(result)).toEqual(seedUsers)
    })

    it('creates a user, who then appears in the list', async () => {
        const { result } = renderAdminUserHooks()
        await loadedUsers(result)

        let created: AdminUser | undefined
        await act(async () => {
            created = await result.current.create.mutateAsync({
                username: 'iva.maric',
                name: 'Iva',
                surname: 'Marić',
                password: 'lozinka123',
            })
        })

        expect(created).toEqual({ id: 5, username: 'iva.maric', name: 'Iva', surname: 'Marić' })
        await waitFor(() => {
            expect(result.current.users.data).toContainEqual(created)
        })
    })

    it('refuses a username already taken in the city with a field error', async () => {
        const { result } = renderAdminUserHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({
                username: 'marin.loncar',
                name: 'Marin',
                surname: 'Drugi',
                password: 'lozinka123',
            }),
        )

        expect(toAdminUserFieldErrors(error)).toEqual({ username: 'duplicate' })
    })

    it('accepts a username another city uses', async () => {
        const { result } = renderAdminUserHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({
                username: otherCityUsername,
                name: 'Ivan',
                surname: 'Marić',
                password: 'lozinka123',
            }),
        )

        expect(error).toBeUndefined()
    })

    it('updates a name and the row in the list', async () => {
        const { result } = renderAdminUserHooks()
        await loadedUsers(result)

        await act(async () => {
            await result.current.update.mutateAsync({
                id: 2,
                name: 'Marin',
                surname: 'Lončar-Horvat',
                password: null,
            })
        })

        await waitFor(() => {
            expect(result.current.users.data).toContainEqual({
                id: 2,
                username: 'marin.loncar',
                name: 'Marin',
                surname: 'Lončar-Horvat',
            })
        })
    })

    it('answers 404 for a user of another city', async () => {
        const { result } = renderAdminUserHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({
                id: 4,
                name: 'Ivan',
                surname: 'Marić',
                password: null,
            }),
        )

        expect(error).toMatchObject({ kind: 'notFound' })
    })

    it('never returns a password from the list, a create or an update', async () => {
        const responses = captureResponses()
        const { result } = renderAdminUserHooks()
        await loadedUsers(result)

        await act(async () => {
            await result.current.create.mutateAsync({
                username: 'iva.maric',
                name: 'Iva',
                surname: 'Marić',
                password: 'lozinka123',
            })
            await result.current.update.mutateAsync({
                id: 2,
                name: 'Marin',
                surname: 'Lončar',
                password: 'nova-lozinka',
            })
        })

        await waitFor(() => {
            // list, create, update, and the list again after the create
            expect(responses.length).toBeGreaterThanOrEqual(3)
        })
        expect(JSON.stringify(responses)).not.toMatch(/password|lozinka/i)
        server.events.removeAllListeners()
    })

    it('keeps no password in the mutation cache once the form is gone', async () => {
        const { result, queryClient, unmount } = renderAdminUserHooks()

        await act(async () => {
            await result.current.create.mutateAsync({
                username: 'iva.maric',
                name: 'Iva',
                surname: 'Marić',
                password: 'lozinka123',
            })
        })
        unmount()

        await waitFor(() => {
            expect(queryClient.getMutationCache().getAll()).toEqual([])
        })
    })

    it('deletes a user, who then leaves the list', async () => {
        const { result } = renderAdminUserHooks()
        await loadedUsers(result)

        await act(async () => {
            await result.current.remove.mutateAsync(2)
        })

        await waitFor(() => {
            expect(result.current.users.data?.map((user) => user.id)).toEqual([1, 3])
        })
    })

    it('refuses to delete the signed-in user with a conflict', async () => {
        const { result } = renderAdminUserHooks()

        const error = await mutationError(() => result.current.remove.mutateAsync(1))

        expect(error).toMatchObject({ kind: 'conflict', body: { code: 'cannotDeleteSelf' } })
    })

    it('rejects a list entry without a username', async () => {
        server.use(
            http.get(apiUrl('/users'), () =>
                HttpResponse.json([{ adminUserId: 1, name: 'Ana', surname: 'Kovač' }]),
            ),
        )
        const { result } = renderAdminUserHooks()

        await waitFor(() => {
            expect(result.current.users.error).toMatchObject({ kind: 'invalidResponse' })
        })
    })
})
