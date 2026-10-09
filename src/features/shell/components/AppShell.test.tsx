import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { languagePickerLabel } from '@/shared/i18n/language'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { stubEmptyStartPage } from '@/test/emptyStartPage'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const navItems = [
    { label: 'Karte', path: '/karte' },
    { label: 'DPK', path: '/dpk' },
    { label: 'Zone', path: '/zone' },
    { label: 'Povlašteni korisnici', path: '/povlasteni-korisnici' },
    { label: 'Kontrolori', path: '/kontrolori' },
    { label: 'Izvještaji', path: '/izvjestaji' },
    { label: 'Postavke grada', path: '/postavke-grada' },
    { label: 'Korisnici', path: '/korisnici' },
]

describe('app shell', () => {
    beforeEach(() => {
        signInForTest()
        stubEmptyStartPage()
    })

    it('opens on Karte from the start page', async () => {
        const { router } = await renderRoute('/')

        expect(router.state.location.pathname).toBe('/karte')
        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.tickets }),
        ).toBeInTheDocument()
    })

    it('starts the focus order with a skip link to main, then logo, nav, language and Odjava', async () => {
        const { user, container } = await renderRoute(paths.tickets)
        await screen.findByText('Grad Samobor')

        await user.tab()
        const skipLink = screen.getByRole('link', { name: hr.shell.skipToContent })
        expect(skipLink).toHaveFocus()
        const main = screen.getByRole('main')
        expect(skipLink).toHaveAttribute('href', `#${main.id}`)

        await user.tab()
        expect(screen.getByRole('link', { name: hr.shell.homeLink })).toHaveFocus()
        for (const { label } of navItems) {
            await user.tab()
            expect(screen.getByRole('link', { name: label })).toHaveFocus()
        }
        await user.tab()
        expect(
            screen.getByRole('button', { name: `${languagePickerLabel}: Hrvatski` }),
        ).toHaveFocus()
        await user.tab()
        expect(screen.getByRole('button', { name: hr.shell.signOut })).toHaveFocus()

        expect(within(main).getByRole('heading', { level: 1 })).toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the city and the signed-in user in the header', async () => {
        await renderRoute(paths.tickets)
        const header = screen.getByRole('banner')

        expect(await within(header).findByText('Grad Samobor')).toBeInTheDocument()
        expect(within(header).getByText('Ana Kovač')).toBeInTheDocument()
        expect(within(header).getByRole('button', { name: hr.shell.signOut })).toBeInTheDocument()
    })

    it('keeps the header usable when the city cannot be loaded', async () => {
        server.use(http.get(apiUrl('/tenant'), () => new HttpResponse(null, { status: 500 })))

        const { queryClient } = await renderRoute(paths.tickets)
        await waitFor(() => {
            expect(
                queryClient.getQueryCache().find({ queryKey: ['tenant', 'name'] })?.state.status,
            ).toBe('error')
        })
        const header = screen.getByRole('banner')

        expect(within(header).queryByText('Grad Samobor')).not.toBeInTheDocument()
        expect(within(header).getByText('Ana Kovač')).toBeInTheDocument()
        expect(within(header).getByRole('button', { name: hr.shell.signOut })).toBeInTheDocument()
    })

    it.each(navItems)(
        'navigates to $label and marks it as the current page',
        async ({ label, path }) => {
            const { user, router } = await renderRoute(paths.tickets)
            const nav = await screen.findByRole('navigation', { name: hr.shell.mainNav })

            await user.click(within(nav).getByRole('link', { name: label }))

            // Built screens load lazily, so the URL changes once their code has loaded.
            await waitFor(() => {
                expect(router.state.location.pathname).toBe(path)
            })
            expect(
                await screen.findByRole('heading', { level: 1, name: label }),
            ).toBeInTheDocument()
            expect(within(nav).getByRole('link', { current: 'page' })).toHaveAccessibleName(label)
            await waitFor(() => {
                expect(document.title).toBe(`${label} – SPARK Admin`)
            })
        },
    )
})
