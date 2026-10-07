import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { mockAdminCredentials } from '@/mocks/adminUsers'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'

const loginUrl = apiUrl('/login')
const loginResponse = {
    token: 'jwt',
    user: { adminUserId: 1, tenantId: 1, username: 'ana', name: 'Ana', surname: 'Kovač' },
}

function getForm() {
    return {
        username: screen.getByLabelText(hr.login.username),
        password: screen.getByLabelText(hr.login.password),
        submit: screen.getByRole('button', { name: hr.login.submit }),
    }
}

async function fillAndSubmit(
    user: Awaited<ReturnType<typeof renderRoute>>['user'],
    { username, password }: { username: string; password: string },
) {
    const form = getForm()
    await user.type(form.username, username)
    await user.type(form.password, password)
    await user.click(form.submit)
}

describe('LoginPage', () => {
    it('shows the logo heading and the form in focus order', async () => {
        const { user } = await renderRoute(paths.login)

        expect(screen.getByRole('heading', { level: 1, name: hr.app.name })).toBeInTheDocument()
        expect(screen.getByRole('form', { name: hr.app.name })).toBeInTheDocument()

        await user.tab()
        expect(getForm().username).toHaveFocus()
        await user.tab()
        expect(getForm().password).toHaveFocus()
        await user.tab()
        expect(screen.getByRole('button', { name: hr.login.showPassword })).toHaveFocus()
        await user.tab()
        expect(getForm().submit).toHaveFocus()
    })

    it('shows a required message on each empty field and sends nothing', async () => {
        let requests = 0
        server.use(
            http.post(loginUrl, () => {
                requests += 1

                return HttpResponse.json(loginResponse)
            }),
        )
        const { user } = await renderRoute(paths.login)

        await user.click(getForm().submit)

        const { username, password } = getForm()
        expect(username).toHaveAccessibleDescription(hr.login.usernameRequired)
        expect(username).toHaveAttribute('aria-invalid', 'true')
        expect(password).toHaveAccessibleDescription(hr.login.passwordRequired)
        expect(password).toHaveAttribute('aria-invalid', 'true')
        expect(username).toHaveFocus()
        expect(requests).toBe(0)
    })

    it('treats a username of only spaces as empty', async () => {
        const { user } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: '   ', password: 'x' })

        expect(getForm().username).toHaveAccessibleDescription(hr.login.usernameRequired)
    })

    it('shows no field error on blur, only on submit, and clears it as the user types', async () => {
        const { user } = await renderRoute(paths.login)
        const { username, submit } = getForm()

        await user.click(username)
        await user.tab()
        expect(username).not.toHaveAccessibleDescription()

        await user.click(submit)
        expect(username).toHaveAccessibleDescription(hr.login.usernameRequired)

        await user.type(username, 'ana')
        expect(username).not.toHaveAccessibleDescription()
        expect(username).not.toHaveAttribute('aria-invalid')
    })

    it('keeps the error on screen while a retry is pending', async () => {
        let requests = 0
        server.use(
            http.post(loginUrl, () => {
                requests += 1
                if (requests === 1) return new HttpResponse(null, { status: 401 })

                return new Promise<never>(() => undefined)
            }),
        )
        const { user } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: 'ana', password: 'kriva' })
        await screen.findByRole('alert')
        await user.click(getForm().submit)

        expect(getForm().submit).toBeDisabled()
        expect(screen.getByRole('alert')).toHaveTextContent(hr.login.errors.unauthorized)
    })

    it('replaces the error and moves focus to it again after a failed retry', async () => {
        let requests = 0
        server.use(
            http.post(loginUrl, () => {
                requests += 1

                return new HttpResponse(null, { status: requests === 1 ? 401 : 500 })
            }),
        )
        const { user } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: 'ana', password: 'kriva' })
        await screen.findByRole('alert')
        await user.click(getForm().submit)

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(hr.login.errors.server)
        })
        expect(screen.getByRole('alert')).toHaveFocus()
    })

    it('shows and hides the password with a pressed toggle', async () => {
        const { user } = await renderRoute(paths.login)
        const toggle = screen.getByRole('button', { name: hr.login.showPassword })

        expect(getForm().password).toHaveAttribute('type', 'password')
        expect(toggle).toHaveAttribute('aria-pressed', 'false')

        await user.click(toggle)
        expect(getForm().password).toHaveAttribute('type', 'text')
        expect(toggle).toHaveAttribute('aria-pressed', 'true')

        await user.click(toggle)
        expect(getForm().password).toHaveAttribute('type', 'password')
    })

    it('posts the typed values and leaves for the home page', async () => {
        let body: unknown
        server.use(
            http.post(loginUrl, async ({ request }) => {
                body = await request.json()

                return HttpResponse.json(loginResponse)
            }),
        )
        const { user, router } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: ' ana ', password: ' tajna 1 ' })

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(paths.home)
        })
        expect(body).toEqual({ username: 'ana', password: ' tajna 1 ' })
    })

    it('signs in with the mock account', async () => {
        const { user, router } = await renderRoute(paths.login)

        await fillAndSubmit(user, mockAdminCredentials)

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(paths.home)
        })
    })

    it.each([
        [
            'wrong credentials',
            () => new HttpResponse(null, { status: 401 }),
            hr.login.errors.unauthorized,
        ],
        [
            'too many attempts',
            () => new HttpResponse(null, { status: 429 }),
            hr.login.errors.rateLimited,
        ],
        [
            'a rejected request',
            () => new HttpResponse(null, { status: 400 }),
            hr.login.errors.server,
        ],
        ['a server error', () => new HttpResponse(null, { status: 500 }), hr.login.errors.server],
        ['a network error', () => HttpResponse.error(), hr.login.errors.network],
    ])('announces %s and keeps the typed values', async (_, resolver, message) => {
        server.use(http.post(loginUrl, resolver))
        const { user } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: 'ana', password: 'kriva' })

        const alert = await screen.findByRole('alert')
        expect(alert).toHaveTextContent(`${hr.login.errorTitle} ${message}`)
        expect(alert).toHaveFocus()
        expect(screen.getByRole('form', { name: hr.app.name })).toHaveAccessibleDescription(
            `${hr.login.errorTitle} ${message}`,
        )
        expect(getForm().username).toHaveValue('ana')
        expect(getForm().password).toHaveValue('kriva')
    })

    it('answers the sixth attempt in a minute with the rate-limit message', async () => {
        const { user } = await renderRoute(paths.login)
        const { username, password, submit } = getForm()
        await user.type(username, 'ana')
        await user.type(password, 'kriva')

        for (let attempt = 1; attempt <= 5; attempt++) {
            await user.click(submit)
            expect(await screen.findByRole('alert')).toHaveTextContent(hr.login.errors.unauthorized)
        }
        await user.click(submit)

        expect(await screen.findByRole('alert')).toHaveTextContent(hr.login.errors.rateLimited)
    })

    it('disables submit while the request is pending and sends it only once', async () => {
        let requests = 0
        server.use(
            http.post(loginUrl, () => {
                requests += 1

                return new Promise<never>(() => undefined)
            }),
        )
        const { user } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: 'ana', password: 'tajna' })

        expect(getForm().submit).toBeDisabled()
        await user.type(getForm().password, '{Enter}')
        await user.click(getForm().submit)
        await new Promise((resolve) => setTimeout(resolve, 50))
        expect(requests).toBe(1)
    })

    it('keeps the password out of the query client', async () => {
        server.use(http.post(loginUrl, () => new HttpResponse(null, { status: 401 })))
        const { user, queryClient } = await renderRoute(paths.login)

        await fillAndSubmit(user, { username: 'ana', password: 'tajna-123' })
        await screen.findByRole('alert')

        const mutations = queryClient.getMutationCache().getAll()
        expect(mutations).not.toHaveLength(0)
        expect(JSON.stringify(mutations.map((m) => m.state))).not.toContain('tajna-123')
    })

    it('has no axe violations, with and without an error', async () => {
        server.use(http.post(loginUrl, () => new HttpResponse(null, { status: 401 })))
        const { user, container } = await renderRoute(paths.login)

        await expectNoAxeViolations(container)

        await fillAndSubmit(user, { username: 'ana', password: 'kriva' })
        await screen.findByRole('alert')
        await expectNoAxeViolations(container)
    })
})
