import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { signInForTest } from '@/test/session'
import { setViewportWidth } from '@/test/viewport'

describe('app shell on a phone', () => {
    beforeEach(() => {
        signInForTest()
        setViewportWidth(375)
    })

    it('hides the navigation behind a menu button in the top bar', async () => {
        await renderRoute(paths.tickets)
        const header = screen.getByRole('banner')

        expect(within(header).getByRole('button', { name: 'Otvori izbornik' })).toBeInTheDocument()
        expect(await within(header).findByText('Grad Samobor')).toBeInTheDocument()
        expect(screen.queryByRole('navigation', { name: hr.shell.mainNav })).not.toBeInTheDocument()
    })

    it('opens the menu drawer, closes it with Escape and returns focus', async () => {
        const { user } = await renderRoute(paths.tickets)
        const menuButton = screen.getByRole('button', { name: 'Otvori izbornik' })

        await user.click(menuButton)

        const drawer = await screen.findByRole('dialog', { name: 'Izbornik' })
        expect(
            within(drawer).getByRole('navigation', { name: hr.shell.mainNav }),
        ).toBeInTheDocument()
        expect(drawer).toContainElement(document.activeElement as HTMLElement)

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(menuButton).toHaveFocus()
    })

    it('starts the focus order with the skip link, then the menu button', async () => {
        const { user } = await renderRoute(paths.tickets)

        await user.tab()
        expect(screen.getByRole('link', { name: hr.shell.skipToContent })).toHaveFocus()
        await user.tab()
        expect(screen.getByRole('button', { name: 'Otvori izbornik' })).toHaveFocus()
    })

    it('closes the drawer after choosing a page, and marks that page as current', async () => {
        const { user, router } = await renderRoute(paths.tickets)

        await user.click(screen.getByRole('button', { name: 'Otvori izbornik' }))
        const drawer = await screen.findByRole('dialog', { name: 'Izbornik' })
        await user.click(within(drawer).getByRole('link', { name: 'Zone' }))

        await waitFor(() => {
            expect(router.state.location.pathname).toBe('/zone')
        })
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(await screen.findByRole('heading', { level: 1, name: 'Zone' })).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Otvori izbornik' }))
        const reopened = await screen.findByRole('dialog', { name: 'Izbornik' })
        expect(within(reopened).getByRole('link', { current: 'page' })).toHaveAccessibleName('Zone')
    })

    it('closes the drawer with its close button', async () => {
        const { user } = await renderRoute(paths.tickets)

        await user.click(screen.getByRole('button', { name: 'Otvori izbornik' }))
        const drawer = await screen.findByRole('dialog', { name: 'Izbornik' })
        await user.click(within(drawer).getByRole('button', { name: 'Zatvori izbornik' }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(screen.getByRole('button', { name: 'Otvori izbornik' })).toHaveFocus()
    })

    it('shows the city, the user and Odjava in the drawer, and signs out from it', async () => {
        const { user, router, container } = await renderRoute(paths.tickets)

        await user.click(screen.getByRole('button', { name: 'Otvori izbornik' }))
        const drawer = await screen.findByRole('dialog', { name: 'Izbornik' })

        expect(await within(drawer).findByText('Grad Samobor')).toBeInTheDocument()
        expect(within(drawer).getByText('Ana Kovač')).toBeInTheDocument()
        await expectNoAxeViolations(container.ownerDocument.body)

        await user.click(within(drawer).getByRole('button', { name: hr.shell.signOut }))

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(paths.login)
        })
        expect(sessionStorage.length).toBe(0)
    })
})
