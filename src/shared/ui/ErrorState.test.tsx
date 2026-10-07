import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ApiError, type ApiErrorKind } from '@/shared/api'
import { hr } from '@/shared/i18n/hr'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

import { ErrorState } from './ErrorState'

const title = 'Zone nije moguće učitati'

function renderErrorState({
    error = new ApiError('network'),
    isRetrying = false,
}: { error?: Error; isRetrying?: boolean } = {}) {
    const onRetry = vi.fn()
    const rendered = renderWithProviders(
        <ErrorState title={title} error={error} onRetry={onRetry} isRetrying={isRetrying} />,
    )

    return { onRetry, ...rendered }
}

describe('ErrorState', () => {
    it('announces the title and what to do next as an alert', () => {
        renderErrorState()

        const alert = screen.getByRole('alert')
        expect(within(alert).getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
        expect(
            within(alert).getByText(
                'Provjerite internetsku vezu i pokušajte ponovno. Ako se pogreška ponavlja, javite se administratoru sustava.',
            ),
        ).toBeInTheDocument()
    })

    it.each<[string, Error, string]>([
        ['forbidden', new ApiError('forbidden', { status: 403 }), hr.listStates.errors.forbidden],
        ['server', new ApiError('server', { status: 500 }), hr.listStates.errors.server],
        [
            'invalidResponse',
            new ApiError('invalidResponse', { status: 200 }),
            hr.listStates.errors.server,
        ],
        ['a plain Error', new Error('boom'), hr.listStates.errors.server],
    ])('shows the message for %s', (_kind, error, message) => {
        renderErrorState({ error })

        expect(screen.getByText(message)).toBeInTheDocument()
    })

    it('never shows the error text itself', () => {
        renderErrorState({ error: new Error('secret stack detail') })

        expect(screen.queryByText(/secret stack detail/)).not.toBeInTheDocument()
    })

    it('calls back on retry', async () => {
        const { user, onRetry } = renderErrorState()

        await user.click(screen.getByRole('button', { name: hr.listStates.retry }))

        expect(onRetry).toHaveBeenCalledOnce()
    })

    it('disables retry while a retry is running', () => {
        renderErrorState({ isRetrying: true })

        expect(screen.getByRole('button', { name: hr.listStates.retry })).toBeDisabled()
    })

    it.each<ApiErrorKind>(['network', 'forbidden'])('has no axe violations (%s)', async (kind) => {
        const { container } = renderErrorState({ error: new ApiError(kind) })

        await expectNoAxeViolations(container)
    })
})
