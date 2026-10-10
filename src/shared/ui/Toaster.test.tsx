import { act, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { toaster } from '@/shared/lib/toaster'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

function showSuccess() {
    act(() => {
        toaster.success({ title: 'Zona ZONA1 je spremljena' })
    })
}

describe('Toaster', () => {
    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
    })

    it('announces a success toast politely', async () => {
        renderWithProviders(<main>Stranica</main>)

        showSuccess()

        const toast = await screen.findByRole('status')
        expect(toast).toHaveTextContent('Zona ZONA1 je spremljena')
    })

    it('closes from its named close button', async () => {
        const { user } = renderWithProviders(<main>Stranica</main>)
        showSuccess()
        const toast = await screen.findByRole('status')

        await user.click(within(toast).getByRole('button', { name: hr.notifications.close }))

        // It then leaves after its exit delay; the closed state is what the user sees at once.
        await waitFor(() => {
            expect(toast).toHaveAttribute('data-state', 'closed')
        })
    })

    it("shows a toast's action as a button that runs it", async () => {
        const { user } = renderWithProviders(<main>Stranica</main>)
        let retries = 0
        act(() => {
            toaster.error({
                title: 'Postavke nisu spremljene',
                action: {
                    label: hr.listStates.retry,
                    onClick: () => {
                        retries += 1
                    },
                },
            })
        })
        await screen.findByText('Postavke nisu spremljene')

        await user.click(screen.getByRole('button', { name: hr.listStates.retry }))

        expect(retries).toBe(1)
    })

    it('has no axe violations', async () => {
        renderWithProviders(<main>Stranica</main>)
        showSuccess()
        await screen.findByRole('status')

        await expectNoAxeViolations(document.body)
    })
})
