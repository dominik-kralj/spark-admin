import { screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { signInForTest } from '@/test/session'

const crash = vi.hoisted(() => ({ layout: false }))

function throwRenderError(): never {
    throw new TypeError('Cannot convert undefined or null to object')
}

vi.mock('@/features/zones/components/ZonesPage', () => ({ ZonesPage: throwRenderError }))

vi.mock('@/AppLayout', async (importOriginal) => {
    const original = await importOriginal<typeof import('@/AppLayout')>()

    return {
        AppLayout: () => {
            if (crash.layout) throwRenderError()

            return <original.AppLayout />
        },
    }
})

describe('Error page', () => {
    beforeEach(() => {
        signInForTest()
        // React reports the caught error to the console; the test expects it.
        vi.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    afterEach(() => {
        crash.layout = false
    })

    it('keeps the shell when a section crashes, and offers a reload and the start page', async () => {
        const { container } = await renderRoute(paths.zones)

        const main = await screen.findByRole('main')
        const heading = await within(main).findByRole('heading', {
            level: 1,
            name: hr.errorPage.title,
        })
        expect(within(main).getByText(hr.errorPage.description)).toBeInTheDocument()
        expect(within(main).getByRole('button', { name: hr.errorPage.reload })).toBeInTheDocument()
        expect(within(main).getByRole('link', { name: hr.errorPage.home })).toHaveAttribute(
            'href',
            paths.home,
        )
        expect(screen.getByRole('link', { name: hr.nav.tickets })).toBeInTheDocument()
        expect(screen.queryByText(/Unexpected Application Error/)).not.toBeInTheDocument()
        await waitFor(() => {
            expect(heading).toHaveFocus()
        })
        await waitFor(() => {
            expect(document.title).toBe(`${hr.errorPage.title} – SPARK Admin`)
        })
        await expectNoAxeViolations(container)
    })

    it('leaves the crashed section through the shell', async () => {
        const { user, router } = await renderRoute(paths.zones)
        await screen.findByRole('heading', { level: 1, name: hr.errorPage.title })

        await user.click(screen.getByRole('link', { name: hr.nav.tickets }))

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(paths.tickets)
        })
        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.tickets }),
        ).toBeInTheDocument()
    })

    it('shows a full page when the shell itself crashes', async () => {
        crash.layout = true
        const { container } = await renderRoute(paths.tickets)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.errorPage.title }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: hr.errorPage.reload })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: hr.nav.tickets })).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })
})
