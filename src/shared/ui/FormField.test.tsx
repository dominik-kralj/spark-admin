import { Input } from '@chakra-ui/react'
import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'

import { FormField } from './FormField'

const helper = '11 znamenki'
const error = 'OIB mora imati točno 11 znamenki.'

describe('FormField', () => {
    it('labels its input', () => {
        renderWithProviders(
            <FormField label="OIB">{(control) => <Input {...control} />}</FormField>,
        )

        expect(screen.getByRole('textbox', { name: 'OIB' })).not.toHaveAttribute('aria-invalid')
    })

    it('ties the helper text to the input', () => {
        renderWithProviders(
            <FormField label="OIB" helperText={helper}>
                {(control) => <Input {...control} />}
            </FormField>,
        )

        expect(screen.getByRole('textbox', { name: 'OIB' })).toHaveAccessibleDescription(helper)
    })

    it('marks the input invalid and ties the error text to it, after the helper', () => {
        renderWithProviders(
            <FormField label="OIB" helperText={helper} error={error}>
                {(control) => <Input {...control} />}
            </FormField>,
        )

        const input = screen.getByRole('textbox', { name: 'OIB' })
        expect(input).toHaveAttribute('aria-invalid', 'true')
        expect(input).toHaveAccessibleDescription(`${helper} ${error}`)
        expect(input).toHaveAccessibleErrorMessage(error)
    })

    it('has no axe violations with helper and error text', async () => {
        const { container } = renderWithProviders(
            <FormField label="OIB" helperText={helper} error={error}>
                {(control) => <Input {...control} />}
            </FormField>,
        )

        await expectNoAxeViolations(container)
    })
})
