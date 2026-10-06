import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { config } from '@/shared/config'
import { server } from '@/test/server'

import { request } from './client'
import { ApiError, type ApiErrorKind } from './errors'
import { setAccessToken } from './session'

const base = `${config.apiBaseUrl}/api/v1/admin`
const zoneSchema = z.object({ zoneId: z.number(), name: z.string() })

async function captureError(promise: Promise<unknown>): Promise<unknown> {
    try {
        await promise
    } catch (error) {
        return error
    }

    throw new Error('Expected the request to fail')
}

afterEach(() => {
    setAccessToken(null)
})

describe('request', () => {
    it('sends the API key and JSON accept header, without a token when signed out', async () => {
        let headers = new Headers()
        server.use(
            http.get(`${base}/zones`, ({ request }) => {
                headers = request.headers

                return HttpResponse.json([])
            }),
        )

        await request('/zones', { schema: z.array(zoneSchema) })

        expect(headers.get('X-API-KEY')).toBe(config.apiKey)
        expect(headers.get('Accept')).toBe('application/json')
        expect(headers.has('Authorization')).toBe(false)
        expect(headers.has('Content-Type')).toBe(false)
    })

    it('sends the bearer token once signed in', async () => {
        let authorization: string | null = null
        server.use(
            http.get(`${base}/zones`, ({ request }) => {
                authorization = request.headers.get('Authorization')

                return HttpResponse.json([])
            }),
        )
        setAccessToken('jwt-123')

        await request('/zones', { schema: z.array(zoneSchema) })

        expect(authorization).toBe('Bearer jwt-123')
    })

    it('returns the parsed body', async () => {
        server.use(http.get(`${base}/zones/1`, () => HttpResponse.json({ zoneId: 1, name: 'A' })))

        await expect(request('/zones/1', { schema: zoneSchema })).resolves.toEqual({
            zoneId: 1,
            name: 'A',
        })
    })

    it('skips empty query params and keeps zero and false', async () => {
        let search = ''
        server.use(
            http.get(`${base}/tickets`, ({ request }) => {
                search = new URL(request.url).search

                return HttpResponse.json([])
            }),
        )

        await request('/tickets', {
            schema: z.array(z.unknown()),
            query: {
                plate: 'ZG1234AB',
                zoneId: undefined,
                from: null,
                status: '',
                page: 0,
                paid: false,
            },
        })

        expect(search).toBe('?plate=ZG1234AB&page=0&paid=false')
    })

    it('sends the body as JSON', async () => {
        let contentType: string | null = null
        let body: unknown
        server.use(
            http.post(`${base}/zones`, async ({ request }) => {
                contentType = request.headers.get('Content-Type')
                body = await request.json()

                return HttpResponse.json({ zoneId: 7, name: 'B' }, { status: 201 })
            }),
        )

        await request('/zones', { method: 'POST', body: { name: 'B' }, schema: zoneSchema })

        expect(contentType).toBe('application/json')
        expect(body).toEqual({ name: 'B' })
    })

    it('resolves a 204 as undefined', async () => {
        server.use(http.delete(`${base}/zones/1`, () => new HttpResponse(null, { status: 204 })))

        await expect(
            request('/zones/1', { method: 'DELETE', schema: z.undefined() }),
        ).resolves.toBeUndefined()
    })

    it.each<[number, ApiErrorKind]>([
        [400, 'validation'],
        [422, 'validation'],
        [401, 'unauthorized'],
        [403, 'forbidden'],
        [404, 'notFound'],
        [409, 'conflict'],
        [429, 'rateLimited'],
        [500, 'server'],
        [503, 'server'],
        [418, 'server'],
    ])('maps HTTP %i to %s', async (status, kind) => {
        server.use(
            http.get(`${base}/zones`, () =>
                HttpResponse.json({ title: 'Problem', status }, { status }),
            ),
        )

        const error = await captureError(request('/zones', { schema: z.array(zoneSchema) }))

        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ kind, status })
    })

    it('maps a non-JSON error body by its status', async () => {
        server.use(
            http.get(`${base}/zones`, () =>
                HttpResponse.text('Neispravan API key.', { status: 401 }),
            ),
        )

        const error = await captureError(request('/zones', { schema: z.array(zoneSchema) }))

        expect(error).toMatchObject({ kind: 'unauthorized', status: 401 })
    })

    it('gives invalidResponse when the body does not match the schema', async () => {
        server.use(http.get(`${base}/zones/1`, () => HttpResponse.json({ zoneId: '1' })))

        const error = await captureError(request('/zones/1', { schema: zoneSchema }))

        expect(error).toMatchObject({ kind: 'invalidResponse', status: 200 })
    })

    it('gives invalidResponse when a success body is not JSON', async () => {
        server.use(http.get(`${base}/zones/1`, () => HttpResponse.html('<html></html>')))

        const error = await captureError(request('/zones/1', { schema: zoneSchema }))

        expect(error).toMatchObject({ kind: 'invalidResponse', status: 200 })
    })

    it('gives network when the request cannot be made', async () => {
        server.use(http.get(`${base}/zones`, () => HttpResponse.error()))

        const error = await captureError(request('/zones', { schema: z.array(zoneSchema) }))

        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ kind: 'network' })
    })

    it('rethrows an abort untouched', async () => {
        server.use(http.get(`${base}/zones`, () => new Promise<never>(() => undefined)))
        const controller = new AbortController()

        const pending = captureError(
            request('/zones', { schema: z.array(zoneSchema), signal: controller.signal }),
        )
        controller.abort()
        const error = await pending

        expect(error).not.toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ name: 'AbortError' })
    })

    it('never puts the token or key in the error message', async () => {
        server.use(http.get(`${base}/zones`, () => HttpResponse.text('boom', { status: 500 })))
        setAccessToken('secret-jwt')

        const error = await captureError(request('/zones', { schema: z.array(zoneSchema) }))

        expect(String(error)).not.toContain('secret-jwt')
        expect(String(error)).not.toContain(config.apiKey)
    })
})
