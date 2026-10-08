import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { mockAdminCredentials } from '@/mocks/adminUsers'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { sendSignedInRequest, signInForTest } from '@/test/session'

const protectedPath = '/nepostojeca-stranica?stranica=2'

function currentUrl(router: RenderedRoute['router']): string {
    const { pathname, search } = router.state.location

    return pathname + search
}

async function signInWithMockAccount(user: RenderedRoute['user']) {
    await user.type(screen.getByLabelText(hr.login.username), mockAdminCredentials.username)
    await user.type(screen.getByLabelText(hr.login.password), mockAdminCredentials.password)
    await user.click(screen.getByRole('button', { name: hr.login.submit }))
}

describe('protected routes', () => {
    it('sends a signed-out visitor to the login page and keeps the requested URL', async () => {
        const { router } = await renderRoute(protectedPath)

        expect(router.state.location.pathname).toBe(paths.login)
        expect(new URLSearchParams(router.state.location.search).get('next')).toBe(protectedPath)
        expect(screen.queryByRole('button', { name: hr.shell.signOut })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: hr.login.submit })).toBeInTheDocument()
    })

    it('returns to the requested URL after sign-in', async () => {
        const { user, router } = await renderRoute(protectedPath)

        await signInWithMockAccount(user)

        await waitFor(() => {
            expect(currentUrl(router)).toBe(protectedPath)
        })
    })

    it('ignores a return URL that points off the site', async () => {
        const { user, router } = await renderRoute(`${paths.login}?next=//evil.example`)

        await signInWithMockAccount(user)

        await waitFor(() => {
            expect(currentUrl(router)).toBe(paths.home)
        })
    })

    it('keeps a stored session across a reload', async () => {
        signInForTest()

        const { router } = await renderRoute(paths.home)

        expect(router.state.location.pathname).toBe(paths.home)
        expect(await screen.findByRole('button', { name: hr.shell.signOut })).toBeInTheDocument()
    })

    it('sends a signed-in user away from the login page', async () => {
        signInForTest()

        const { router } = await renderRoute(paths.login)

        expect(router.state.location.pathname).toBe(paths.home)
    })

    it('ends the session on a 401 from any call: login, a message, an empty cache', async () => {
        server.use(http.get(apiUrl('/zones'), () => new HttpResponse(null, { status: 401 })))
        signInForTest()
        const { router, queryClient, container } = await renderRoute(protectedPath)
        queryClient.setQueryData(['zones'], [{ id: 1 }])

        await sendSignedInRequest('/zones')

        expect(await screen.findByRole('status')).toHaveTextContent(hr.login.sessionExpired)
        expect(router.state.location.pathname).toBe(paths.login)
        expect(new URLSearchParams(router.state.location.search).get('next')).toBe(protectedPath)
        await waitFor(() => {
            expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
        })
        expect(sessionStorage.length).toBe(0)
        await expectNoAxeViolations(container)
    })

    it('signs out: clears the session and cache, and Back does not reopen the app', async () => {
        signInForTest()
        const { user, router, queryClient } = await renderRoute(protectedPath)
        queryClient.setQueryData(['zones'], [{ id: 1 }])
        await router.navigate(paths.home)

        await user.click(await screen.findByRole('button', { name: hr.shell.signOut }))

        await waitFor(() => {
            expect(currentUrl(router)).toBe(paths.login)
        })
        expect(screen.queryByText(hr.login.sessionExpired)).not.toBeInTheDocument()
        expect(sessionStorage.length).toBe(0)
        await waitFor(() => {
            expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
        })

        await router.navigate(-1)

        expect(router.state.location.pathname).toBe(paths.login)
        expect(screen.queryByRole('button', { name: hr.shell.signOut })).not.toBeInTheDocument()
    })
})
