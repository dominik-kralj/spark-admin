import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { renderHookWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import { useCreateZone, useDeleteZone, useUpdateZone, useZones } from './useZones'
import { toZoneFieldErrors, type Zone, type ZoneInput } from '../validators/zone'

const firstZone: Zone = {
    id: 1,
    code: 'ZONA1',
    name: 'Prva zona',
    price: 0.7,
    dailyTicketPrice: 15,
    durationMinutes: 60,
    maxExtensions: 2,
    dpkIssueDelayMinutes: 15,
}

const otherCityZoneId = 3
const otherCityZone = { code: 'ZONA2', name: 'Druga zona' }

const newZone: ZoneInput = {
    code: 'ZONA3',
    name: 'Treća zona',
    price: 0.4,
    dailyTicketPrice: 10,
    durationMinutes: 120,
    maxExtensions: 3,
    dpkIssueDelayMinutes: 15,
}

function renderZoneHooks() {
    signInForTest()

    return renderHookWithQueryClient(() => ({
        zones: useZones(),
        create: useCreateZone(),
        update: useUpdateZone(),
        remove: useDeleteZone(),
    }))
}

type ZoneHooks = ReturnType<typeof renderZoneHooks>['result']

async function loadedZones(result: ZoneHooks): Promise<Zone[]> {
    await waitFor(() => {
        expect(result.current.zones.isSuccess).toBe(true)
    })

    return result.current.zones.data ?? []
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

describe('useZones', () => {
    it("lists the city's seed zones, mapped to the domain", async () => {
        const { result } = renderZoneHooks()

        const zones = await loadedZones(result)

        expect(zones).toHaveLength(2)
        expect(zones[0]).toEqual(firstZone)
        expect(zones.map((zone) => zone.code)).toEqual(['ZONA1', '2A'])
    })

    it('reports a failed list', async () => {
        server.use(http.get(apiUrl('/zones'), () => new HttpResponse(null, { status: 500 })))
        const { result } = renderZoneHooks()

        await waitFor(() => {
            expect(result.current.zones.error).toMatchObject({ kind: 'server' })
        })
    })
})

describe('useCreateZone', () => {
    it('creates a zone and refreshes the list', async () => {
        const { result } = renderZoneHooks()
        await loadedZones(result)

        let created: Zone | undefined
        await act(async () => {
            created = await result.current.create.mutateAsync(newZone)
        })

        expect(created).toEqual({ id: expect.any(Number) as number, ...newZone })
        await waitFor(() => {
            expect(result.current.zones.data).toContainEqual(created)
        })
    })

    it("allows a code and name that only another city's zone uses", async () => {
        const { result } = renderZoneHooks()

        await act(async () => {
            await result.current.create.mutateAsync({ ...newZone, ...otherCityZone })
        })

        expect(result.current.create.isSuccess).toBe(true)
    })

    it.each([
        ['code', { ...newZone, code: 'zona1' }],
        ['name', { ...newZone, name: 'Prva zona' }],
    ] as const)('rejects a duplicate %s with a 409 on that field', async (field, input) => {
        const { result } = renderZoneHooks()

        const error = await mutationError(() => result.current.create.mutateAsync(input))

        expect(error).toMatchObject({ kind: 'conflict', status: 409 })
        expect(toZoneFieldErrors(error)).toEqual({ [field]: 'duplicate' })
    })

    it('rejects invalid values with a 400 on each field', async () => {
        const { result } = renderZoneHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({ ...newZone, price: -1, durationMinutes: 0 }),
        )

        expect(error).toMatchObject({ kind: 'validation', status: 400 })
        expect(toZoneFieldErrors(error)).toEqual({ price: 'invalid', durationMinutes: 'invalid' })
    })

    it('rejects a price with more than two decimals, like the DECIMAL(10,2) column', async () => {
        const { result } = renderZoneHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({ ...newZone, dailyTicketPrice: 0.705 }),
        )

        expect(toZoneFieldErrors(error)).toEqual({ dailyTicketPrice: 'invalid' })
    })
})

describe('useUpdateZone', () => {
    it('saves the zone and puts it in the cached list', async () => {
        const { result } = renderZoneHooks()
        await loadedZones(result)
        const edited = { ...firstZone, price: 0.8 }

        await act(async () => {
            await result.current.update.mutateAsync(edited)
        })

        expect(result.current.zones.data?.[0]).toEqual(edited)
    })

    it("allows a zone to keep its own code and name, but not take another zone's", async () => {
        const { result } = renderZoneHooks()
        const [, second] = await loadedZones(result)
        if (second === undefined) throw new Error('Expected a second seed zone')

        await act(async () => {
            await result.current.update.mutateAsync({ ...firstZone, maxExtensions: 4 })
        })
        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...second, code: firstZone.code }),
        )

        expect(toZoneFieldErrors(error)).toEqual({ code: 'duplicate' })
    })

    it('rejects invalid values with a 400 on each field', async () => {
        const { result } = renderZoneHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...firstZone, name: '', maxExtensions: 1.5 }),
        )

        expect(toZoneFieldErrors(error)).toEqual({ name: 'invalid', maxExtensions: 'invalid' })
    })

    it.each([
        ['does not exist', 999],
        ['belongs to another city', otherCityZoneId],
    ])('answers 404 for a zone that %s', async (_case, id) => {
        const { result } = renderZoneHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...firstZone, id }),
        )

        expect(error).toMatchObject({ kind: 'notFound', status: 404 })
    })
})

describe('useDeleteZone', () => {
    it('deletes the zone and refreshes the list', async () => {
        const { result } = renderZoneHooks()
        await loadedZones(result)

        await act(async () => {
            await result.current.remove.mutateAsync(firstZone.id)
        })

        await waitFor(() => {
            expect(result.current.zones.data?.map((zone) => zone.id)).toEqual([2])
        })
    })

    it.each([
        ['does not exist', 999],
        ['belongs to another city', otherCityZoneId],
    ])('treats a 404 for a zone that %s as already deleted', async (_case, zoneId) => {
        const { result } = renderZoneHooks()

        await act(async () => {
            await result.current.remove.mutateAsync(zoneId)
        })

        expect(result.current.remove.isSuccess).toBe(true)
    })
})
