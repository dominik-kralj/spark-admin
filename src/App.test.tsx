import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from '@/App'
import { hr } from '@/shared/i18n/hr'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

describe('App', () => {
    it('renders the app name as the page heading', () => {
        renderWithProviders(<App />)
        expect(screen.getByRole('heading', { level: 1, name: hr.app.name })).toBeInTheDocument()
    })

    it('has no axe violations', async () => {
        const { container } = renderWithProviders(<App />)
        await expectNoAxeViolations(container)
    })
})
