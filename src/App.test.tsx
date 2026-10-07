import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from '@/App'
import { hr } from '@/shared/i18n/hr'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

describe('App', () => {
    it('opens on the login page when signed out', async () => {
        const { container } = renderWithProviders(<App />)

        expect(await screen.findByRole('button', { name: hr.login.submit })).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 1, name: hr.app.name })).toBeInTheDocument()
        await expectNoAxeViolations(container)
    })
})
