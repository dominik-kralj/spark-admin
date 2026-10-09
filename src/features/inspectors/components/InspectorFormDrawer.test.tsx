import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
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

const t = hr.inspectors
const { labels } = t.form

type TextLabel = 'name' | 'surname' | 'oib'

const newInspector: Record<TextLabel | 'pin', string> = {
    name: 'Ivana',
    surname: 'Kos',
    oib: '56789012345',
    pin: '0420',
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
    // The text button from md and the phone's icon button share the name; jsdom shows both.
    const [addButton] = await screen.findAllByRole('button', { name: t.add })
    if (addButton === undefined) throw new Error('Expected an add button')
    await user.click(addButton)

    return openedForm(t.add)
}

async function openEditForm({ user }: RenderedRoute, name: string) {
    const table = await screen.findByRole('table', { name: t.listLabel })
    await user.click(within(table).getByRole('button', { name: t.editInspector(name) }))

    return openedForm(t.editInspector(name))
}

function field(form: HTMLElement, label: TextLabel) {
    return within(form).getByRole('textbox', { name: labels[label] })
}

// A password input has no role; its label still names it.
function pinField(form: HTMLElement) {
    return within(form).getByLabelText(labels.pin)
}

function activeSwitch(form: HTMLElement) {
    return within(form).getByRole('switch', { name: labels.isActive })
}

async function fillForm(
    rendered: RenderedRoute,
    form: HTMLElement,
    values: Partial<typeof newInspector>,
) {
    for (const [label, value] of Object.entries(values) as [TextLabel | 'pin', string][]) {
        const input = label === 'pin' ? pinField(form) : field(form, label)
        await rendered.user.clear(input)
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

describe('Inspector form', () => {
    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
    })

    beforeEach(() => {
        signInForTest()
        giveElementsLayout()
    })

    it('adds an active inspector: the right payload, a toast, and the row', async () => {
        const bodies = captureBodies('post', '/inspectors')
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)
        expect(within(form).getByText(t.form.intro)).toBeInTheDocument()
        expect(activeSwitch(form)).toBeChecked()

        await fillForm(rendered, form, newInspector)
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            {
                name: 'Ivana',
                surname: 'Kos',
                oib: '56789012345',
                pin: '0420',
                isActive: true,
            },
        ])
        expect(await screen.findByText(t.form.saved('Ivana Kos'))).toBeInTheDocument()
        const table = screen.getByRole('table', { name: t.listLabel })
        expect(await within(table).findByRole('cell', { name: 'Kos' })).toBeInTheDocument()
    })

    it('adds an inactive inspector without asking', async () => {
        const bodies = captureBodies('post', '/inspectors')
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, newInspector)
        await rendered.user.click(activeSwitch(form))
        await save(rendered, form)

        await expectFormClosed()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(bodies).toMatchObject([{ isActive: false }])
    })

    it('masks the PIN, and its button shows and hides it with a pressed state', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)
        const pin = pinField(form)
        const toggle = within(form).getByRole('button', { name: t.form.showPin })
        expect(pin).toHaveAttribute('type', 'password')
        expect(pin).toHaveAttribute('inputmode', 'numeric')
        expect(pin).toHaveAttribute('autocomplete', 'off')
        expect(pin).toHaveAccessibleDescription(t.form.pinHelp)
        expect(toggle).toHaveAttribute('aria-pressed', 'false')

        await rendered.user.click(toggle)

        expect(pin).toHaveAttribute('type', 'text')
        expect(toggle).toHaveAttribute('aria-pressed', 'true')

        await rendered.user.click(toggle)

        expect(pin).toHaveAttribute('type', 'password')
    })

    it('keeps only the first four digits typed or pasted into the PIN', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)
        const pin = pinField(form)

        await rendered.user.type(pin, '1a2 3-456')
        expect(pin).toHaveValue('1234')

        await rendered.user.clear(pin)
        await rendered.user.paste('98 76 54')
        expect(pin).toHaveValue('9876')
    })

    it('checks the OIB on blur', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)
        const oib = field(form, 'oib')

        await rendered.user.type(oib, '1234567890')
        await rendered.user.tab()

        expect(oib).toBeInvalid()
        expect(oib).toHaveAccessibleDescription(hr.forms.validation.oibInvalid)

        await rendered.user.type(oib, '1')

        expect(oib).toBeValid()
    })

    it('shows a one-line notice and moves focus to the first invalid field on an empty save', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)

        await save(rendered, form)

        expect(await within(form).findByRole('alert')).toHaveTextContent(t.form.notSaved)
        await waitFor(() => {
            expect(field(form, 'name')).toHaveFocus()
        })
        expect(field(form, 'oib')).toHaveAccessibleDescription(hr.forms.validation.required)
        expect(pinField(form)).toHaveAccessibleDescription(
            `${t.form.pinHelp} ${hr.forms.validation.required}`,
        )
    })

    it('puts a duplicate OIB from the server on the OIB field', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, { ...newInspector, oib: '12345678901' })
        await save(rendered, form)

        await waitFor(() => {
            expect(field(form, 'oib')).toHaveFocus()
        })
        expect(field(form, 'oib')).toHaveAccessibleDescription(t.form.duplicateOib)
    })

    it('shows a server error above the fields and keeps the input', async () => {
        server.use(http.post(apiUrl('/inspectors'), () => new HttpResponse(null, { status: 500 })))
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, newInspector)
        await save(rendered, form)

        const alert = await within(form).findByRole('alert')
        expect(alert).toHaveTextContent(`${hr.forms.saveFailed} ${hr.forms.errors.server}`)
        await waitFor(() => {
            expect(alert).toHaveFocus()
        })
        expect(field(form, 'surname')).toHaveValue('Kos')
    })

    it('pre-fills the edit form with the stored PIN, masked until shown', async () => {
        const bodies = captureBodies('put', '/inspectors/:inspectorId')
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')

        expect(field(form, 'name')).toHaveValue('Marko')
        expect(field(form, 'surname')).toHaveValue('Horvat')
        expect(field(form, 'oib')).toHaveValue('12345678901')
        expect(activeSwitch(form)).toBeChecked()
        const pin = pinField(form)
        await waitFor(() => {
            expect(pin).toHaveValue('1234')
        })
        expect(pin).toHaveAttribute('type', 'password')
        expect(pin).toBeEnabled()

        await rendered.user.click(within(form).getByRole('button', { name: t.form.showPin }))

        expect(pin).toHaveAttribute('type', 'text')

        await fillForm(rendered, form, { surname: 'Horvat-Kos' })
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            {
                name: 'Marko',
                surname: 'Horvat-Kos',
                oib: '12345678901',
                pin: '1234',
                isActive: true,
            },
        ])
        const table = screen.getByRole('table', { name: t.listLabel })
        expect(await within(table).findByRole('cell', { name: 'Horvat-Kos' })).toBeInTheDocument()
    })

    it('keeps the PIN field and Spremi off until the PIN has loaded', async () => {
        server.use(
            http.get(apiUrl('/inspectors/:inspectorId'), async () => {
                await delay('infinite')

                return HttpResponse.json({})
            }),
        )
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')

        await fillForm(rendered, form, { surname: 'Horvat-Kos' })

        expect(pinField(form)).toBeDisabled()
        expect(within(form).getByRole('button', { name: hr.forms.save })).toBeDisabled()
    })

    it('says when the PIN could not be loaded, and loads it again on retry', async () => {
        server.use(
            http.get(
                apiUrl('/inspectors/:inspectorId'),
                () => new HttpResponse(null, { status: 500 }),
                { once: true },
            ),
        )
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')

        const alert = await within(form).findByRole('alert')
        expect(
            within(alert).getByRole('heading', { name: t.form.pinLoadError }),
        ).toBeInTheDocument()
        expect(pinField(form)).toBeDisabled()

        await rendered.user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        await waitFor(() => {
            expect(pinField(form)).toHaveValue('1234')
        })
        expect(within(form).queryByRole('alert')).not.toBeInTheDocument()
    })

    it('keeps a name typed before the PIN arrives', async () => {
        server.use(
            http.get(apiUrl('/inspectors/:inspectorId'), async () => {
                await delay(200)

                return HttpResponse.json({
                    inspectorId: 1,
                    name: 'Marko',
                    surname: 'Horvat',
                    oib: '12345678901',
                    pin: '1234',
                    isActive: true,
                })
            }),
        )
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')

        await fillForm(rendered, form, { surname: 'Horvat-Kos' })

        await waitFor(() => {
            expect(pinField(form)).toHaveValue('1234')
        })
        expect(field(form, 'surname')).toHaveValue('Horvat-Kos')
    })

    it('sends a new PIN when one is typed into the edit form', async () => {
        const bodies = captureBodies('put', '/inspectors/:inspectorId')
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')

        await fillForm(rendered, form, { pin: '7' })
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toMatchObject([{ pin: '7' }])
    })

    it('asks before deactivating, naming the inspector, and keeps them active on cancel', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')
        const toggle = activeSwitch(form)
        expect(within(form).getByText(t.form.yes)).toBeInTheDocument()

        await rendered.user.click(toggle)

        const dialog = await screen.findByRole('alertdialog', {
            name: t.deactivate.title('Marko Horvat'),
        })
        expect(dialog).toHaveAccessibleDescription(t.deactivate.description('Marko Horvat'))
        await waitFor(() => {
            expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toHaveFocus()
        })
        await rendered.user.click(within(dialog).getByRole('button', { name: hr.forms.cancel }))

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        await waitFor(() => {
            expect(toggle).toHaveFocus()
        })
        expect(toggle).toBeChecked()
        expect(within(form).getByRole('button', { name: hr.forms.save })).toBeDisabled()
    })

    it('deactivates once confirmed, and saves the inspector as inactive', async () => {
        const bodies = captureBodies('put', '/inspectors/:inspectorId')
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')

        await rendered.user.click(activeSwitch(form))
        const dialog = await screen.findByRole('alertdialog')
        // The dialog takes clicks once it has opened, which is when it focuses Odustani.
        await waitFor(() => {
            expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toHaveFocus()
        })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: t.deactivate.confirm }),
        )

        await waitFor(() => {
            expect(activeSwitch(form)).not.toBeChecked()
        })
        expect(within(form).getByText(t.form.no)).toBeInTheDocument()
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toMatchObject([{ isActive: false }])
        const table = screen.getByRole('table', { name: t.listLabel })
        const row = within(table).getByRole('cell', { name: 'Horvat' }).closest('tr')
        expect(row).toHaveTextContent(t.status.inactive)
    })

    it('activates an inactive inspector without asking', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Davor Šimić')
        expect(activeSwitch(form)).not.toBeChecked()

        await rendered.user.click(activeSwitch(form))

        expect(activeSwitch(form)).toBeChecked()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('asks before discarding changes, and returns focus to the edit button on close', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Petra Novak')
        await waitFor(() => {
            expect(pinField(form)).toHaveValue('2580')
        })
        await rendered.user.type(field(form, 'name'), 'a')

        await rendered.user.click(within(form).getByRole('button', { name: hr.forms.close }))
        const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.confirm }),
        )

        await expectFormClosed()
        const table = screen.getByRole('table', { name: t.listLabel })
        // The drawer hands focus back as its exit ends, which a full parallel run slows past 3 s.
        await waitFor(
            () => {
                expect(
                    within(table).getByRole('button', { name: t.editInspector('Petra Novak') }),
                ).toHaveFocus()
            },
            { timeout: 5000 },
        )
    })

    it('opens the edit form from a card on a phone', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.inspectors)
        const list = await screen.findByRole('list', { name: t.listLabel })

        await rendered.user.click(
            within(list).getByRole('button', { name: t.editInspector('Davor Šimić') }),
        )
        const form = await openedForm(t.editInspector('Davor Šimić'))
        expect(field(form, 'surname')).toHaveValue('Šimić')
    })

    it('has no axe violations with the form open and showing errors', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openAddForm(rendered)
        await save(rendered, form)
        await waitFor(() => {
            expect(field(form, 'name')).toBeInvalid()
        })

        await expectNoAxeViolations(document.body)
    })

    it('has no axe violations with the deactivate dialog open', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const form = await openEditForm(rendered, 'Marko Horvat')
        await rendered.user.click(activeSwitch(form))
        await screen.findByRole('alertdialog')

        await expectNoAxeViolations(document.body)
    })
})
