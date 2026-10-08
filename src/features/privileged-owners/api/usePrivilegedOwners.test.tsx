import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { renderHookWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import {
    useCreatePrivilegedOwner,
    useDeletePrivilegedOwner,
    usePrivilegedOwners,
    useUpdatePrivilegedOwner,
} from './usePrivilegedOwners'
import {
    toPrivilegedOwnerFieldErrors,
    type PrivilegedOwner,
    type PrivilegedOwnerInput,
} from '../validators/privilegedOwner'

const firstOwner: PrivilegedOwner = {
    id: 1,
    plate: 'ZG5553AI',
    validUntil: new Date('2027-06-30T21:59:59.999Z'),
    ownerName: 'Marija Jurić',
    address: { street: 'Livadićeva ulica', houseNo: '3', zipCode: '10430', city: 'Samobor' },
}

const otherCityOwnerId = 7

const newOwner: PrivilegedOwnerInput = {
    plate: 'ZG7777AB',
    validUntil: new Date('2027-01-31T22:59:59.999Z'),
    ownerName: 'Ivana Horvat',
    address: { street: 'Gajeva ulica', houseNo: '5a', zipCode: '10430', city: 'Samobor' },
}

function renderOwnerHooks() {
    signInForTest()

    return renderHookWithQueryClient(() => ({
        owners: usePrivilegedOwners(),
        create: useCreatePrivilegedOwner(),
        update: useUpdatePrivilegedOwner(),
        remove: useDeletePrivilegedOwner(),
    }))
}

type OwnerHooks = ReturnType<typeof renderOwnerHooks>['result']

async function loadedOwners(result: OwnerHooks): Promise<PrivilegedOwner[]> {
    await waitFor(() => {
        expect(result.current.owners.isSuccess).toBe(true)
    })

    return result.current.owners.data ?? []
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

describe('usePrivilegedOwners', () => {
    it("lists the city's seed entries, valid and expired, mapped to the domain", async () => {
        const { result } = renderOwnerHooks()

        const owners = await loadedOwners(result)

        expect(owners).toHaveLength(6)
        expect(owners[0]).toEqual(firstOwner)
        expect(owners.map((owner) => owner.plate)).not.toContain('ZG0001ZZ')
    })

    it('reports a failed list', async () => {
        server.use(
            http.get(apiUrl('/privileged-owners'), () => new HttpResponse(null, { status: 500 })),
        )
        const { result } = renderOwnerHooks()

        await waitFor(() => {
            expect(result.current.owners.error).toMatchObject({ kind: 'server' })
        })
    })
})

describe('useCreatePrivilegedOwner', () => {
    it('creates an entry and refreshes the list', async () => {
        const { result } = renderOwnerHooks()
        await loadedOwners(result)

        let created: PrivilegedOwner | undefined
        await act(async () => {
            created = await result.current.create.mutateAsync(newOwner)
        })

        expect(created).toEqual({ id: expect.any(Number) as number, ...newOwner })
        await waitFor(() => {
            expect(result.current.owners.data).toContainEqual(created)
        })
    })

    it('rejects invalid values with a 400 on each field', async () => {
        const { result } = renderOwnerHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({
                ...newOwner,
                plate: 'ZG1234XY',
                ownerName: '',
                address: { ...newOwner.address, zipCode: '1'.repeat(11) },
            }),
        )

        expect(error).toMatchObject({ kind: 'validation', status: 400 })
        expect(toPrivilegedOwnerFieldErrors(error)).toEqual({
            plate: 'invalid',
            ownerName: 'invalid',
            zipCode: 'invalid',
        })
    })
})

describe('useUpdatePrivilegedOwner', () => {
    it('saves the entry and puts it in the cached list', async () => {
        const { result } = renderOwnerHooks()
        await loadedOwners(result)
        const renewed = { ...firstOwner, validUntil: new Date('2028-06-30T21:59:59.999Z') }

        await act(async () => {
            await result.current.update.mutateAsync(renewed)
        })

        expect(result.current.owners.data?.[0]).toEqual(renewed)
    })

    it.each([
        ['does not exist', 999],
        ['belongs to another city', otherCityOwnerId],
    ])('answers 404 for an entry that %s', async (_case, id) => {
        const { result } = renderOwnerHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...firstOwner, id }),
        )

        expect(error).toMatchObject({ kind: 'notFound', status: 404 })
    })
})

describe('useDeletePrivilegedOwner', () => {
    it('deletes the entry and refreshes the list', async () => {
        const { result } = renderOwnerHooks()
        await loadedOwners(result)

        await act(async () => {
            await result.current.remove.mutateAsync(firstOwner.id)
        })

        await waitFor(() => {
            expect(result.current.owners.data?.map((owner) => owner.id)).not.toContain(
                firstOwner.id,
            )
        })
        expect(result.current.owners.data).toHaveLength(5)
    })

    it.each([
        ['does not exist', 999],
        ['belongs to another city', otherCityOwnerId],
    ])('treats a 404 for an entry that %s as already deleted', async (_case, id) => {
        const { result } = renderOwnerHooks()

        await act(async () => {
            await result.current.remove.mutateAsync(id)
        })

        expect(result.current.remove.isSuccess).toBe(true)
    })
})
