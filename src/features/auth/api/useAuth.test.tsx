import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { mockAdminCredentials } from '@/mocks/adminAccount'
import { apiUrl } from '@/mocks/url'
import { startSession } from '@/shared/api'
import { renderHookWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { sendSignedInRequest } from '@/test/session'

import { getSession, useAuth, type SignInFailure } from './useAuth'
import type { Session } from '../validators/session'

const loginResponse = {
    token: 'jwt-1',
    user: { adminUserId: 4, tenantId: 1, username: 'ana', name: 'Ana', surname: 'Kovač' },
}
const session = {
    user: { id: 4, tenantId: 1, username: 'ana', firstName: 'Ana', lastName: 'Kovač' },
}

function renderUseAuth(onSignIn: (session: Session) => void = vi.fn()) {
    return renderHookWithQueryClient(() => useAuth({ onSignIn }))
}

function authorizationOfNextRequest(): Promise<string | null> {
    return new Promise((resolve) => {
        server.use(
            http.get(apiUrl('/zones'), ({ request }) => {
                resolve(request.headers.get('Authorization'))

                return HttpResponse.json([])
            }),
        )
        void sendSignedInRequest('/zones')
    })
}

describe('useAuth', () => {
    it('posts the credentials and starts a session with the user mapped to the domain', async () => {
        let body: unknown
        server.use(
            http.post(apiUrl('/login'), async ({ request }) => {
                body = await request.json()

                return HttpResponse.json(loginResponse)
            }),
        )
        const onSignIn = vi.fn()
        const { result } = renderUseAuth(onSignIn)

        act(() => {
            result.current.signIn({ username: 'ana', password: 'tajna' })
        })

        await waitFor(() => {
            expect(onSignIn).toHaveBeenCalledWith(session)
        })
        expect(body).toEqual({ username: 'ana', password: 'tajna' })
        expect(getSession()).toEqual(session)
        await expect(authorizationOfNextRequest()).resolves.toBe('Bearer jwt-1')
    })

    it('reports a failed login and keeps the session empty', async () => {
        server.use(http.post(apiUrl('/login'), () => new HttpResponse(null, { status: 401 })))
        const { result } = renderUseAuth()

        act(() => {
            result.current.signIn({ username: 'ana', password: 'kriva' })
        })

        await waitFor(() => {
            expect(result.current.failure).toMatchObject<Partial<SignInFailure>>({ attempt: 1 })
        })
        expect(result.current.failure?.error).toMatchObject({ kind: 'unauthorized' })
        expect(getSession()).toBeNull()
        await expect(authorizationOfNextRequest()).resolves.toBeNull()
    })

    it('signs in with the mock account', async () => {
        const onSignIn = vi.fn()
        const { result } = renderUseAuth(onSignIn)

        act(() => {
            result.current.signIn(mockAdminCredentials)
        })

        await waitFor(() => {
            expect(onSignIn).toHaveBeenCalledOnce()
        })
    })

    it('signs out', () => {
        startSession('jwt-1', session.user)
        const { result } = renderUseAuth()

        result.current.signOut()

        expect(getSession()).toBeNull()
    })

    it('treats a stored user of the wrong shape as signed out and drops its token', async () => {
        startSession('jwt-1', { adminUserId: 4 })

        expect(getSession()).toBeNull()
        await expect(authorizationOfNextRequest()).resolves.toBeNull()
    })
})
