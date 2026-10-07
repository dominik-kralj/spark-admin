import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { signInForTest } from '@/test/session'
import { setViewportWidth } from '@/test/viewport'

const pageNames = [
    'Karte',
    'DPK',
    'Zone',
    'Povlašteni korisnici',
    'Kontrolori',
    'Izvještaji',
    'Postavke grada',
    'Korisnici',
]

describe('app shell on a tablet', () => {
    beforeEach(() => {
        signInForTest()
        setViewportWidth(768)
    })

    it('shows an icon rail whose links are named by their page', async () => {
        const { container } = await renderRoute(paths.zones)
        const rail = screen.getByRole('navigation', { name: hr.shell.mainNav })

        expect(
            within(rail)
                .getAllByRole('link')
                .map((link) => link.textContent),
        ).toEqual(pageNames.map(() => ''))
        for (const name of pageNames) {
            expect(within(rail).getByRole('link', { name })).toBeInTheDocument()
        }
        expect(within(rail).getByRole('link', { current: 'page' })).toHaveAccessibleName('Zone')
        expect(await within(screen.getByRole('banner')).findByText('Grad Samobor')).toBeVisible()
        expect(screen.getByRole('button', { name: hr.shell.signOut })).toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('expands the full menu over the page and collapses it again', async () => {
        const { user, container } = await renderRoute(paths.tickets)
        const toggle = screen.getByRole('button', { name: 'Proširi izbornik' })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')

        await user.click(toggle)

        const menu = await screen.findByRole('dialog', { name: 'Izbornik' })
        expect(toggle).toHaveAttribute('aria-expanded', 'true')
        expect(within(menu).getByRole('link', { name: 'Povlašteni korisnici' })).toHaveTextContent(
            'Povlašteni korisnici',
        )
        expect(menu).toContainElement(document.activeElement as HTMLElement)
        await expectNoAxeViolations(container.ownerDocument.body)

        await user.click(within(menu).getByRole('button', { name: 'Sažmi izbornik' }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(toggle).toHaveFocus()
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes the expanded menu with Escape and after choosing a page', async () => {
        const { user, router } = await renderRoute(paths.tickets)
        const toggle = screen.getByRole('button', { name: 'Proširi izbornik' })

        await user.click(toggle)
        await screen.findByRole('dialog', { name: 'Izbornik' })
        await user.keyboard('{Escape}')
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(toggle).toHaveFocus()

        await user.click(toggle)
        const menu = await screen.findByRole('dialog', { name: 'Izbornik' })
        await user.click(within(menu).getByRole('link', { name: 'Kontrolori' }))

        expect(router.state.location.pathname).toBe('/kontrolori')
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
