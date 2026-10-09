import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { processingStatuses } from '@/shared/lib/processingStatus'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

import { ProcessingStatusChip } from './ProcessingStatusChip'

describe('ProcessingStatusChip', () => {
    it.each([
        ['pending', 'Na čekanju'],
        ['processing', 'U obradi'],
        ['done', 'Plaćeno'],
        ['failed', 'Neuspjelo'],
    ] as const)('words the payment status %s as %s', (status, label) => {
        renderWithProviders(<ProcessingStatusChip stage="payment" status={status} />)

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it.each([
        ['pending', 'Na čekanju'],
        ['processing', 'U obradi'],
        ['done', 'Fiskalizirano'],
        ['failed', 'Neuspjelo'],
    ] as const)('words the fiscalization status %s as %s', (status, label) => {
        renderWithProviders(<ProcessingStatusChip stage="fiscal" status={status} />)

        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('gives every status its own icon, hidden from screen readers', () => {
        const { container } = renderWithProviders(
            <>
                {processingStatuses.map((status) => (
                    <ProcessingStatusChip key={status} stage="payment" status={status} />
                ))}
            </>,
        )
        const icons = [...container.querySelectorAll('svg')]

        expect(icons).toHaveLength(4)
        expect(icons.every((icon) => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
        expect(new Set(icons.map((icon) => icon.getAttribute('class'))).size).toBe(4)
    })

    it('has no axe violations', async () => {
        const { container } = renderWithProviders(
            <>
                {processingStatuses.map((status) => (
                    <ProcessingStatusChip key={status} stage="fiscal" status={status} />
                ))}
            </>,
        )

        await expectNoAxeViolations(container)
    })
})
