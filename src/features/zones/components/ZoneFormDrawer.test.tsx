import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { toaster } from '@/shared/lib/toaster'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { giveElementsLayout } from '@/test/layout'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'
import { setViewportWidth } from '@/test/viewport'

const { labels, errors } = hr.zones.form

type Label = keyof typeof labels

const newZone: Record<Label, string> = {
    code: 'ZONA3',
    name: 'Treća zona',
    price: '0,70',
    dailyTicketPrice: '15.5',
    durationMinutes: '45',
    maxExtensions: '1',
    dpkIssueDelayMinutes: '10',
}

/** Records the JSON body of each matching request; the mock still answers it. */
function captureBodies(method: 'post' | 'put', path: string): unknown[] {
    const bodies: unknown[] = []
    server.use(
        http[method](apiUrl(path), async ({ request }) => {
            bodies.push(await request.clone().json())
        }),
    )

    return bodies
}

/** Resolves once focus is on the title, as it is by the time a person can type. */
async function openedForm(title: string) {
    const form = await screen.findByRole('dialog', { name: title })
    await waitFor(() => {
        expect(within(form).getByRole('heading', { name: title })).toHaveFocus()
    })

    return form
}

async function openAddForm({ user }: RenderedRoute) {
    await user.click(await screen.findByRole('button', { name: hr.zones.add }))

    return openedForm(hr.zones.add)
}

async function openEditForm({ user }: RenderedRoute, code: string) {
    const table = await screen.findByRole('table', { name: hr.zones.listLabel })
    await user.click(within(table).getByRole('button', { name: hr.zones.editZone(code) }))

    return openedForm(hr.zones.editZone(code))
}

function field(form: HTMLElement, label: Label) {
    return within(form).getByLabelText(labels[label])
}

async function fillForm(rendered: RenderedRoute, form: HTMLElement, values: Record<Label, string>) {
    for (const [label, value] of Object.entries(values) as [Label, string][]) {
        await rendered.user.clear(field(form, label))
        // Pasting fires the same input events as typing, at a fraction of the cost.
        await rendered.user.paste(value)
    }
}

async function save({ user }: RenderedRoute, form: HTMLElement) {
    await user.click(within(form).getByRole('button', { name: hr.forms.save }))
}

async function expectFormClosed() {
    await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
}

describe('Zone form', () => {
    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
    })

    beforeEach(() => {
        signInForTest()
        giveElementsLayout()
    })

    it('adds a zone: the right payload, a toast, and the zone in the list', async () => {
        const bodies = captureBodies('post', '/zones')
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)
        expect(within(form).getByText(hr.zones.form.intro)).toBeInTheDocument()

        await fillForm(rendered, form, newZone)
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            {
                zoneCode: 'ZONA3',
                zoneName: 'Treća zona',
                price: 0.7,
                dailyTicketPrice: 15.5,
                durationMinutes: 45,
                maxExtensions: 1,
                dpkIssueDelayMinutes: 10,
            },
        ])
        expect(await screen.findByText(hr.zones.form.saved('ZONA3'))).toBeInTheDocument()
        const table = screen.getByRole('table', { name: hr.zones.listLabel })
        expect(await within(table).findByRole('cell', { name: 'ZONA3' })).toBeInTheDocument()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('takes the minutes and extensions as whole numbers, and the prices as text', async () => {
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)

        for (const label of ['durationMinutes', 'maxExtensions', 'dpkIssueDelayMinutes'] as const) {
            const input = within(form).getByRole('spinbutton', { name: labels[label] })
            expect(input).toHaveAttribute('step', '1')
        }
        expect(field(form, 'durationMinutes')).toHaveAttribute('min', '1')
        expect(field(form, 'maxExtensions')).toHaveAttribute('min', '0')
        expect(within(form).getByRole('textbox', { name: labels.price })).toHaveAttribute(
            'inputmode',
            'decimal',
        )
    })

    it('pre-fills the edit form with exactly the stored values', async () => {
        const rendered = await renderRoute(paths.zones)

        const form = await openEditForm(rendered, 'ZONA1')

        const stored: Record<Label, string> = {
            code: 'ZONA1',
            name: 'Prva zona',
            price: '0,70',
            dailyTicketPrice: '15,00',
            durationMinutes: '60',
            maxExtensions: '2',
            dpkIssueDelayMinutes: '15',
        }
        for (const [label, value] of Object.entries(stored) as [Label, string][]) {
            expect(field(form, label)).toHaveDisplayValue(value)
        }
    })

    it('edits a zone: a point is read as the decimal separator, and the row updates', async () => {
        const bodies = captureBodies('put', '/zones/:zoneId')
        const rendered = await renderRoute(paths.zones)
        const form = await openEditForm(rendered, 'ZONA1')

        await rendered.user.clear(field(form, 'price'))
        await rendered.user.type(field(form, 'price'), '0.80')
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            {
                zoneCode: 'ZONA1',
                zoneName: 'Prva zona',
                price: 0.8,
                dailyTicketPrice: 15,
                durationMinutes: 60,
                maxExtensions: 2,
                dpkIssueDelayMinutes: 15,
            },
        ])
        expect(await screen.findByText(hr.zones.form.saved('ZONA1'))).toBeInTheDocument()
        const table = screen.getByRole('table', { name: hr.zones.listLabel })
        expect(within(table).getByRole('cell', { name: '0,80 EUR' })).toBeInTheDocument()
    })

    it.each([
        ['code', '', errors.required],
        ['code', 'A'.repeat(21), errors.tooLong],
        ['name', 'N'.repeat(21), errors.tooLong],
        ['name', '', errors.required],
        ['price', '', errors.required],
        ['dailyTicketPrice', '15,505', errors.tooManyDecimals],
        ['maxExtensions', '2147483648', errors.tooLarge],
        ['price', 'abc', errors.notAmount],
        ['price', '1,005', errors.tooManyDecimals],
        ['dailyTicketPrice', '100000000', errors.tooLarge],
        ['durationMinutes', '1.5', errors.notWholeNumber],
        ['durationMinutes', '0', errors.notPositive],
        ['maxExtensions', '-1', errors.notWholeNumber],
        ['dpkIssueDelayMinutes', '2147483648', errors.tooLarge],
    ] as const)(
        'shows the error for %s "%s" on leaving the field',
        async (label, value, message) => {
            const rendered = await renderRoute(paths.zones)
            const form = await openAddForm(rendered)
            const input = field(form, label)

            await rendered.user.click(input)
            if (value !== '') await rendered.user.type(input, value)
            await rendered.user.tab()

            expect(input).toBeInvalid()
            expect(input).toHaveAccessibleDescription(message)
        },
    )

    it('clears an error as soon as the value becomes valid', async () => {
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)
        const price = field(form, 'price')
        await rendered.user.type(price, '1,005')
        await rendered.user.tab()
        expect(price).toBeInvalid()

        await rendered.user.type(price, '{Backspace}')

        expect(price).toBeValid()
        expect(price).not.toHaveAccessibleDescription()
    })

    it('keeps Spremi off on a new zone until something is typed', async () => {
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)
        const saveButton = within(form).getByRole('button', { name: hr.forms.save })
        expect(saveButton).toBeDisabled()

        await rendered.user.type(field(form, 'name'), 'B')

        expect(saveButton).toBeEnabled()
    })

    it('sends nothing on a save with invalid fields, marks each one and focuses the first', async () => {
        const bodies = captureBodies('post', '/zones')
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)
        await rendered.user.type(field(form, 'name'), 'Treća zona')

        await save(rendered, form)

        await waitFor(() => {
            expect(field(form, 'code')).toHaveFocus()
        })
        expect(field(form, 'code')).toHaveAccessibleDescription(errors.required)
        expect(field(form, 'name')).toBeValid()
        expect(field(form, 'dpkIssueDelayMinutes')).toHaveAccessibleDescription(errors.required)
        expect(within(form).queryByRole('alert')).not.toBeInTheDocument()
        expect(bodies).toEqual([])
    })

    it.each([
        ['code', { code: 'zona1' }, hr.zones.form.duplicate.code],
        ['name', { name: 'Prva zona' }, hr.zones.form.duplicate.name],
    ] as const)(
        'puts a duplicate %s from the server on that field',
        async (label, values, message) => {
            const rendered = await renderRoute(paths.zones)
            const form = await openAddForm(rendered)

            await fillForm(rendered, form, { ...newZone, ...values })
            await save(rendered, form)

            await waitFor(() => {
                expect(field(form, label)).toHaveFocus()
            })
            expect(field(form, label)).toHaveAccessibleDescription(message)
            expect(within(form).queryByRole('alert')).not.toBeInTheDocument()
        },
    )

    it('keeps Spremi off on an edit until a value differs from the stored one', async () => {
        const rendered = await renderRoute(paths.zones)
        const form = await openEditForm(rendered, 'ZONA1')
        const saveButton = within(form).getByRole('button', { name: hr.forms.save })
        expect(saveButton).toBeDisabled()

        await rendered.user.type(field(form, 'name'), ' B')
        expect(saveButton).toBeEnabled()

        await rendered.user.type(field(form, 'name'), '{Backspace}{Backspace}')
        expect(saveButton).toBeDisabled()
    })

    it('shows a server error above the fields and keeps the input', async () => {
        server.use(http.post(apiUrl('/zones'), () => new HttpResponse(null, { status: 500 })))
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, newZone)
        await save(rendered, form)

        const alert = await within(form).findByRole('alert')
        expect(alert).toHaveTextContent(`${hr.forms.saveFailed} ${hr.forms.errors.server}`)
        await waitFor(() => {
            expect(alert).toHaveFocus()
        })
        expect(field(form, 'code')).toHaveValue('ZONA3')
    })

    it('asks before discarding changes, and returns focus to the edit button on close', async () => {
        const rendered = await renderRoute(paths.zones)
        const form = await openEditForm(rendered, 'ZONA1')
        await rendered.user.type(field(form, 'name'), ' B')

        await rendered.user.click(within(form).getByRole('button', { name: hr.forms.close }))
        const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
        await waitFor(() => {
            expect(
                within(dialog).getByRole('button', { name: hr.forms.discard.keepEditing }),
            ).toHaveFocus()
        })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.confirm }),
        )

        await expectFormClosed()
        const table = screen.getByRole('table', { name: hr.zones.listLabel })
        expect(
            within(table).getByRole('button', { name: hr.zones.editZone('ZONA1') }),
        ).toHaveFocus()
        expect(within(table).getByRole('cell', { name: 'Prva zona' })).toBeInTheDocument()
    })

    it('starts the add form empty after an edit was discarded', async () => {
        const rendered = await renderRoute(paths.zones)
        await openEditForm(rendered, 'ZONA1')
        await rendered.user.click(screen.getByRole('button', { name: hr.forms.close }))
        await expectFormClosed()

        const form = await openAddForm(rendered)

        expect(field(form, 'code')).toHaveValue('')
    })

    it('opens the edit form from a card on a phone', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.zones)
        const list = await screen.findByRole('list', { name: hr.zones.listLabel })

        await rendered.user.click(
            within(list).getByRole('button', { name: hr.zones.editZone('2A') }),
        )

        const form = await openedForm(hr.zones.editZone('2A'))
        expect(field(form, 'code')).toHaveValue('2A')
    })

    it('has no axe violations with the form open and showing errors', async () => {
        const rendered = await renderRoute(paths.zones)
        const form = await openAddForm(rendered)
        await rendered.user.type(field(form, 'name'), 'B')
        await save(rendered, form)
        await waitFor(() => {
            expect(field(form, 'code')).toBeInvalid()
        })

        await expectNoAxeViolations(document.body)
    })
})
