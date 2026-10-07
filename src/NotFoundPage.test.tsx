import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { signInForTest } from '@/test/session'

describe('NotFoundPage', () => {
    it('tells a signed-in user the page does not exist and links home', async () => {
        signInForTest()
        const { user, router } = await renderRoute('/nema/ove/stranice')

        expect(
            screen.getByRole('heading', { level: 1, name: hr.notFound.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(hr.notFound.description)).toBeInTheDocument()

        await user.click(screen.getByRole('link', { name: hr.notFound.home }))

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(paths.home)
        })
    })

    it('stays hidden from a signed-out visitor, who gets the login page', async () => {
        const { router } = await renderRoute('/nema/ove/stranice')

        expect(router.state.location.pathname).toBe(paths.login)
        expect(screen.queryByText(hr.notFound.title)).not.toBeInTheDocument()
    })

    it('has no axe violations', async () => {
        signInForTest()
        const { container } = await renderRoute('/nema')

        await expectNoAxeViolations(container)
    })
})
