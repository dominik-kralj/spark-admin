import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { skeletonRecipe } from '@/shared/theme/recipes/skeleton'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

import { LoadingState } from './LoadingState'

const label = 'Učitavanje zona…'
const columnWidths = [1, 2, 1, 1, 1, 1, 1]

describe('LoadingState', () => {
    it('announces its label as a status', () => {
        renderWithProviders(<LoadingState label={label} columnWidths={columnWidths} />)

        expect(screen.getByRole('status')).toHaveTextContent(label)
    })

    it('hides every skeleton from screen readers', () => {
        const { container } = renderWithProviders(
            <LoadingState label={label} columnWidths={columnWidths} />,
        )

        const skeletons = container.querySelectorAll('.chakra-skeleton')
        expect(skeletons.length).toBeGreaterThan(0)
        for (const skeleton of skeletons) {
            expect(skeleton.closest('[aria-hidden="true"]')).not.toBeNull()
        }
    })

    it('draws one table cell skeleton per column in each row, sized like the columns', () => {
        const { container } = renderWithProviders(
            <LoadingState label={label} columnWidths={columnWidths} />,
        )

        const rows = container.querySelectorAll('[data-skeleton-row]')
        expect(rows).toHaveLength(3)
        expect(rows[0]?.querySelectorAll('.chakra-skeleton')).toHaveLength(7)
        expect(rows[0]).toHaveStyle({ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr 1fr' })
    })

    it('stops the skeleton animation when reduced motion is on', () => {
        expect(skeletonRecipe.base).toMatchObject({ _motionReduce: { animation: 'none' } })
    })

    it('has no axe violations', async () => {
        const { container } = renderWithProviders(
            <LoadingState label={label} columnWidths={columnWidths} />,
        )

        await expectNoAxeViolations(container)
    })
})
