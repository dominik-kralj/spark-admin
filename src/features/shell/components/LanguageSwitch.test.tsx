import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { en } from '@/shared/i18n/en'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { signInForTest } from '@/test/session'
import { setViewportWidth } from '@/test/viewport'

async function chooseEnglish(
    user: RenderedRoute['user'],
    { scope = document.body, trigger = 'Jezik / Language: HR' } = {},
) {
    await user.click(within(scope).getByRole('button', { name: trigger }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'English' }))
}

describe('language switch', () => {
    it('starts in Croatian', async () => {
        signInForTest()
        await renderRoute(paths.zones)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.zones }),
        ).toBeInTheDocument()
        expect(document.documentElement.lang).toBe('hr')
    })

    it('switches the app to English from the header, and remembers it after a reload', async () => {
        signInForTest()
        const { user, container, unmount } = await renderRoute(paths.zones)
        await screen.findByRole('table')

        await chooseEnglish(user, { scope: screen.getByRole('banner') })

        expect(
            await screen.findByRole('heading', { level: 1, name: en.nav.zones }),
        ).toBeInTheDocument()
        expect(screen.getByRole('navigation', { name: en.shell.mainNav })).toBeInTheDocument()
        expect(screen.getByRole('table', { name: en.zones.listLabel })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: en.shell.signOut })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Jezik / Language: EN' })).toBeInTheDocument()
        expect(document.documentElement.lang).toBe('en')
        await waitFor(() => {
            expect(document.title).toBe('Zones – SPARK Admin')
        })
        await expectNoAxeViolations(container)

        unmount()
        await renderRoute(paths.zones)

        expect(
            await screen.findByRole('heading', { level: 1, name: en.nav.zones }),
        ).toBeInTheDocument()
    })

    it('offers the switch above Odjava in the phone menu drawer', async () => {
        signInForTest()
        setViewportWidth(375)
        const { user } = await renderRoute(paths.zones)

        await user.click(screen.getByRole('button', { name: hr.shell.openMenu }))
        const drawer = await screen.findByRole('dialog', { name: hr.shell.menu })
        await chooseEnglish(user, { scope: drawer, trigger: 'Jezik / Language: Hrvatski' })

        expect(
            await within(drawer).findByRole('button', { name: en.shell.signOut }),
        ).toBeInTheDocument()
        expect(within(drawer).getByRole('link', { name: en.nav.zones })).toBeInTheDocument()
        expect(
            within(drawer).getByRole('button', { name: 'Jezik / Language: English' }),
        ).toBeInTheDocument()
    })

    it('can be switched on the login page, before signing in', async () => {
        const { user, container } = await renderRoute(paths.login)

        await chooseEnglish(user)

        expect(await screen.findByLabelText(en.login.username)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: en.login.submit })).toBeInTheDocument()
        await waitFor(() => {
            expect(document.title).toBe('Sign in – SPARK Admin')
        })
        await expectNoAxeViolations(container)
    })

    it('shows validation messages in the chosen language', async () => {
        const { user } = await renderRoute(paths.login)
        await chooseEnglish(user)

        await user.click(screen.getByRole('button', { name: en.login.submit }))

        expect(await screen.findByText(en.login.usernameRequired)).toBeInTheDocument()
        expect(screen.getByText(en.login.passwordRequired)).toBeInTheDocument()
    })
})
