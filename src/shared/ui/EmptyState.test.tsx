import { Button } from '@chakra-ui/react'
import { screen } from '@testing-library/react'
import { MapPin } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

import { EmptyState } from './EmptyState'

const title = 'Još nema zona'
const description =
    'Dodajte prvu zonu kako bi vozači mogli plaćati parkiranje, a kontrolori izdavati dnevne karte.'

describe('EmptyState', () => {
    it('says why the list is empty under a level-2 heading, with the fixing action', () => {
        renderWithProviders(
            <EmptyState
                icon={<MapPin />}
                title={title}
                description={description}
                action={<Button>Dodaj zonu</Button>}
            />,
        )

        expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
        expect(screen.getByText(description)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Dodaj zonu' })).toBeInTheDocument()
    })

    it('renders without an action', () => {
        renderWithProviders(
            <EmptyState icon={<MapPin />} title={title} description={description} />,
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('has no axe violations', async () => {
        const { container } = renderWithProviders(
            <EmptyState
                icon={<MapPin />}
                title={title}
                description={description}
                action={<Button>Dodaj zonu</Button>}
            />,
        )

        await expectNoAxeViolations(container)
    })
})
