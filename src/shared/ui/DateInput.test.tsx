import { Input } from '@chakra-ui/react'
import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { renderWithProviders } from '@/test/render'

import { DateInput } from './DateInput'
import { FormField } from './FormField'

const label = 'Datum od'
// Every month the calendar opens on has a 15th.
const dayFifteen = /(^|\s)15\. /

function dayCells() {
    return screen.queryAllByRole('button', { name: dayFifteen, hidden: true })
}

describe('DateInput', () => {
    // Every keystroke in the field re-renders the picker, so a closed calendar must cost nothing.
    it('keeps the calendar out of the page while it is closed', async () => {
        const { user } = renderWithProviders(
            <FormField label={label}>
                {(control) => (
                    <DateInput label={label} value="" onPick={() => undefined}>
                        <Input {...control} />
                    </DateInput>
                )}
            </FormField>,
        )
        expect(dayCells()).toHaveLength(0)

        await user.click(screen.getByRole('button', { name: hr.forms.datePicker.open(label) }))
        expect(await screen.findByRole('button', { name: dayFifteen })).toBeVisible()

        await user.keyboard('{Escape}')
        await waitFor(() => {
            expect(dayCells()).toHaveLength(0)
        })
    })
})
