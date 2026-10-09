import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { renderHookWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import { useCreateInspector, useInspectors, useUpdateInspector } from './useInspectors'
import {
    toInspectorFieldErrors,
    type Inspector,
    type InspectorInput,
} from '../validators/inspector'

const firstInspector: Inspector = {
    id: 1,
    name: 'Marko',
    surname: 'Horvat',
    oib: '12345678901',
    isActive: true,
}

const otherCityInspectorId = 4
const otherCityOib = '45678901234'

const newInspectorFields: Omit<Inspector, 'id'> = {
    name: 'Ivana',
    surname: 'Kos',
    oib: '56789012345',
    isActive: true,
}

const newInspector: InspectorInput = { ...newInspectorFields, pin: '4321' }

function renderInspectorHooks() {
    signInForTest()

    return renderHookWithQueryClient(() => ({
        inspectors: useInspectors(),
        create: useCreateInspector(),
        update: useUpdateInspector(),
    }))
}

type InspectorHooks = ReturnType<typeof renderInspectorHooks>['result']

async function loadedInspectors(result: InspectorHooks): Promise<Inspector[]> {
    await waitFor(() => {
        expect(result.current.inspectors.isSuccess).toBe(true)
    })

    return result.current.inspectors.data ?? []
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

describe('useInspectors', () => {
    it("lists the city's seed inspectors, mapped to the domain and without PINs", async () => {
        const { result } = renderInspectorHooks()

        const inspectors = await loadedInspectors(result)

        expect(inspectors).toHaveLength(3)
        expect(inspectors[0]).toEqual(firstInspector)
        expect(inspectors.map((inspector) => inspector.isActive)).toEqual([true, true, false])
    })

    it('never receives a PIN from the mock', async () => {
        let body: unknown
        server.events.on('response:mocked', async ({ response }) => {
            body = await response.clone().json()
        })
        const { result } = renderInspectorHooks()

        await loadedInspectors(result)

        expect(JSON.stringify(body)).not.toMatch(/pin/i)
        server.events.removeAllListeners()
    })

    it('reports a failed list', async () => {
        server.use(http.get(apiUrl('/inspectors'), () => new HttpResponse(null, { status: 500 })))
        const { result } = renderInspectorHooks()

        await waitFor(() => {
            expect(result.current.inspectors.error).toMatchObject({ kind: 'server' })
        })
    })
})

describe('useCreateInspector', () => {
    it('creates an inspector and refreshes the list', async () => {
        const { result } = renderInspectorHooks()
        await loadedInspectors(result)

        let created: Inspector | undefined
        await act(async () => {
            created = await result.current.create.mutateAsync(newInspector)
        })

        expect(created).toEqual({ id: expect.any(Number) as number, ...newInspectorFields })
        await waitFor(() => {
            expect(result.current.inspectors.data).toContainEqual(created)
        })
    })

    it("allows an OIB that only another city's inspector uses", async () => {
        const { result } = renderInspectorHooks()

        await act(async () => {
            await result.current.create.mutateAsync({ ...newInspector, oib: otherCityOib })
        })

        expect(result.current.create.isSuccess).toBe(true)
    })

    it('rejects a duplicate OIB in the city with a 409 on that field', async () => {
        const { result } = renderInspectorHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({ ...newInspector, oib: firstInspector.oib }),
        )

        expect(error).toMatchObject({ kind: 'conflict', status: 409 })
        expect(toInspectorFieldErrors(error)).toEqual({ oib: 'duplicate' })
    })

    it('rejects a missing PIN, a short OIB and an empty name with a 400 on each field', async () => {
        const { result } = renderInspectorHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({ ...newInspectorFields, name: ' ', oib: '123' }),
        )

        expect(error).toMatchObject({ kind: 'validation', status: 400 })
        expect(toInspectorFieldErrors(error)).toEqual({
            name: 'invalid',
            oib: 'invalid',
            pin: 'invalid',
        })
    })

    it('rejects a PIN that is not one to four digits', async () => {
        const { result } = renderInspectorHooks()

        const error = await mutationError(() =>
            result.current.create.mutateAsync({ ...newInspector, pin: '12a45' }),
        )

        expect(toInspectorFieldErrors(error)).toEqual({ pin: 'invalid' })
    })
})

describe('useUpdateInspector', () => {
    it('saves the inspector without a PIN and puts it in the cached list', async () => {
        const { result } = renderInspectorHooks()
        await loadedInspectors(result)
        const deactivated = { ...firstInspector, isActive: false }

        await act(async () => {
            await result.current.update.mutateAsync(deactivated)
        })

        expect(result.current.inspectors.data?.[0]).toEqual(deactivated)
    })

    it('sends a new PIN when one is given', async () => {
        let body: unknown
        server.events.on('request:start', async ({ request }) => {
            if (request.method === 'PUT') body = await request.clone().json()
        })
        const { result } = renderInspectorHooks()

        await act(async () => {
            await result.current.update.mutateAsync({ ...firstInspector, pin: '0007' })
        })

        expect(body).toMatchObject({ pin: '0007' })
        server.events.removeAllListeners()
    })

    it("allows an inspector to keep its own OIB, but not take another inspector's", async () => {
        const { result } = renderInspectorHooks()
        const [, second] = await loadedInspectors(result)
        if (second === undefined) throw new Error('Expected a second seed inspector')

        await act(async () => {
            await result.current.update.mutateAsync({ ...firstInspector, surname: 'Horvat-Kos' })
        })
        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...second, oib: firstInspector.oib }),
        )

        expect(toInspectorFieldErrors(error)).toEqual({ oib: 'duplicate' })
    })

    it.each([
        ['does not exist', 999],
        ['belongs to another city', otherCityInspectorId],
    ])('answers 404 for an inspector that %s', async (_case, id) => {
        const { result } = renderInspectorHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...firstInspector, id }),
        )

        expect(error).toMatchObject({ kind: 'notFound', status: 404 })
    })
})
