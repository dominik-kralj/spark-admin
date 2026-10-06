import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { config } from '@/shared/config'
import { server } from '@/test/server'

import { signIn } from './auth'
import { request } from './client'
import { setAccessToken } from './session'

const base = `${config.apiBaseUrl}/api/v1/admin`

afterEach(() => {
    setAccessToken(null)
})

describe('signIn', () => {
    it('posts the credentials and maps the user to the domain', async () => {
        let body: unknown
        server.use(
            http.post(`${base}/login`, async ({ request }) => {
                body = await request.json()

                return HttpResponse.json({
                    token: 'jwt-1',
                    user: {
                        adminUserId: 4,
                        tenantId: 1,
                        username: 'ana',
                        name: 'Ana',
                        surname: 'Kovač',
                    },
                })
            }),
        )

        const session = await signIn({ username: 'ana', password: 'tajna' })

        expect(body).toEqual({ username: 'ana', password: 'tajna' })
        expect(session).toEqual({
            user: { id: 4, tenantId: 1, username: 'ana', firstName: 'Ana', lastName: 'Kovač' },
        })
    })

    it('sends the token on later requests', async () => {
        let authorization: string | null = null
        server.use(
            http.post(`${base}/login`, () =>
                HttpResponse.json({
                    token: 'jwt-2',
                    user: { adminUserId: 1, tenantId: 1, username: 'a', name: 'A', surname: 'B' },
                }),
            ),
            http.get(`${base}/zones`, ({ request }) => {
                authorization = request.headers.get('Authorization')

                return HttpResponse.json([])
            }),
        )

        await signIn({ username: 'a', password: 'b' })
        await request('/zones', { schema: z.array(z.unknown()) })

        expect(authorization).toBe('Bearer jwt-2')
    })

    it('keeps the token unset when the login fails', async () => {
        let authorization: string | null = 'unset'
        server.use(
            http.post(`${base}/login`, () => new HttpResponse(null, { status: 401 })),
            http.get(`${base}/zones`, ({ request }) => {
                authorization = request.headers.get('Authorization')

                return HttpResponse.json([])
            }),
        )

        await expect(signIn({ username: 'a', password: 'b' })).rejects.toMatchObject({
            kind: 'unauthorized',
        })
        await request('/zones', { schema: z.array(z.unknown()) })

        expect(authorization).toBeNull()
    })
})
