import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

const t = hr.privilegedOwners
const { labels } = t.form
const validation = hr.forms.validation

type Label = keyof typeof labels

const now = new Date('2026-10-08T10:00:00Z')

const newOwner: Record<Label, string> = {
    plate: 'zg 777-ab',
    validUntil: '31.01.2027',
    ownerName: 'Ivana Horvat',
    street: 'Gajeva ulica',
    houseNo: '5a',
    zipCode: '10430',
    city: 'Samobor',
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
    await user.click(await screen.findByRole('button', { name: t.add }))

    return openedForm(t.addLong)
}

async function openEditForm({ user }: RenderedRoute, plate: string) {
    const table = await screen.findByRole('table', { name: t.listLabel })
    await user.click(within(table).getByRole('button', { name: t.editOwner(plate) }))

    return openedForm(t.editOwner(plate))
}

function field(form: HTMLElement, label: Label) {
    return within(form).getByRole('textbox', { name: labels[label] })
}

async function fillForm(rendered: RenderedRoute, form: HTMLElement, values: Record<Label, string>) {
    for (const [label, value] of Object.entries(values) as [Label, string][]) {
        await rendered.user.clear(field(form, label))
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

describe('Privileged owner form', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'], now })
        signInForTest()
        giveElementsLayout()
    })

    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
        vi.useRealTimers()
    })

    it('adds an entry: the plate normalised, the end of the day in Zagreb, a toast and a row', async () => {
        const bodies = captureBodies('post', '/privileged-owners')
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)
        expect(within(form).getByText(t.form.intro)).toBeInTheDocument()

        await fillForm(rendered, form, newOwner)
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            {
                vehicleRegistration: 'ZG777AB',
                validUntil: '2027-01-31T22:59:59.999Z',
                ownerName: 'Ivana Horvat',
                address: 'Gajeva ulica',
                houseNo: '5a',
                zipCode: '10430',
                city: 'Samobor',
            },
        ])
        expect(await screen.findByText(t.form.saved('ZG777AB'))).toBeInTheDocument()
        const table = screen.getByRole('table', { name: t.listLabel })
        const row = await within(table).findByRole('row', { name: /ZG777AB/ })
        expect(row).toHaveTextContent('31.01.2027')
    })

    it('normalises the plate when the field loses focus, with its help text tied to it', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)
        const plate = field(form, 'plate')
        expect(plate).toHaveAccessibleDescription(t.form.plateHelp)

        await rendered.user.type(plate, 'zg 1234-ab')
        expect(plate).toHaveValue('zg 1234-ab')
        await rendered.user.tab()

        expect(plate).toHaveValue('ZG1234AB')
        expect(plate).toBeValid()
    })

    it('pre-fills the edit form with the stored values and the date in Zagreb', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)

        const form = await openEditForm(rendered, 'ZG1234AB')

        const stored: Record<Label, string> = {
            plate: 'ZG1234AB',
            validUntil: '31.12.2026',
            ownerName: 'Josip Babić',
            street: 'Perkovčeva ulica',
            houseNo: '12',
            zipCode: '10430',
            city: 'Samobor',
        }
        for (const [label, value] of Object.entries(stored) as [Label, string][]) {
            expect(field(form, label)).toHaveValue(value)
        }
        expect(within(form).queryByText(t.form.expiredNote)).not.toBeInTheDocument()
    })

    it('renews an expired entry: the note, then the new date in the payload and the row', async () => {
        const bodies = captureBodies('put', '/privileged-owners/:id')
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openEditForm(rendered, 'ZG9087KL')
        const note = within(form).getByRole('status')
        expect(note).toHaveTextContent(`${t.form.expired('30.09.2026')} ${t.form.expiredNote}`)

        await rendered.user.clear(field(form, 'validUntil'))
        await rendered.user.type(field(form, 'validUntil'), '30.06.2027')
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            {
                vehicleRegistration: 'ZG9087KL',
                validUntil: '2027-06-30T21:59:59.999Z',
                ownerName: 'Tomislav Knežević',
                address: 'Starogradska ulica',
                houseNo: '21',
                zipCode: '10430',
                city: 'Samobor',
            },
        ])
        const table = screen.getByRole('table', { name: t.listLabel })
        const row = within(table).getByRole('row', { name: /ZG9087KL/ })
        expect(row).toHaveTextContent('30.06.2027')
        expect(row).toHaveTextContent(t.status.valid)
    })

    it.each([
        ['plate', '', validation.required],
        ['plate', 'ZG.1234-AB', validation.plateInvalid],
        ['plate', 'ZG 1234-XY', validation.plateInvalid],
        ['validUntil', '', validation.required],
        ['validUntil', '2027-01-31', validation.dateFormat],
        ['validUntil', '31.02.2027', validation.dateInvalid],
        ['validUntil', '29.02.2027', validation.dateInvalid],
        ['ownerName', '', validation.required],
        ['ownerName', 'N'.repeat(201), t.form.tooLong(200)],
        ['street', 'S'.repeat(151), t.form.tooLong(150)],
        ['houseNo', '1'.repeat(21), t.form.tooLong(20)],
        ['zipCode', '1'.repeat(11), t.form.tooLong(10)],
        ['city', 'C'.repeat(101), t.form.tooLong(100)],
    ] as const)(
        'shows the error for %s "%s" on leaving the field',
        async (label, value, message) => {
            const rendered = await renderRoute(paths.privilegedOwners)
            const form = await openAddForm(rendered)
            const input = field(form, label)

            await rendered.user.click(input)
            if (value !== '') await rendered.user.paste(value)
            await rendered.user.tab()

            expect(input).toBeInvalid()
            expect(input).toHaveAccessibleDescription(expect.stringContaining(message) as string)
        },
    )

    it('accepts a leap day and a pasted date with spaces', async () => {
        const bodies = captureBodies('post', '/privileged-owners')
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, { ...newOwner, validUntil: ' 29. 02. 2028. ' })
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            expect.objectContaining({ validUntil: '2028-02-29T22:59:59.999Z' }) as unknown,
        ])
    })

    it('shows a one-line notice and moves focus to the first invalid field on an empty save', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)

        await save(rendered, form)

        expect(await within(form).findByRole('alert')).toHaveTextContent(t.form.notSaved)
        await waitFor(() => {
            expect(field(form, 'plate')).toHaveFocus()
        })
        expect(field(form, 'city')).toHaveAccessibleDescription(validation.required)
    })

    it('puts a field error from the server on that field', async () => {
        server.use(
            http.post(apiUrl('/privileged-owners'), () =>
                HttpResponse.json(
                    { status: 400, errors: { zipCode: ['invalid'] } },
                    { status: 400 },
                ),
            ),
        )
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, newOwner)
        await save(rendered, form)

        await waitFor(() => {
            expect(field(form, 'zipCode')).toHaveFocus()
        })
        expect(field(form, 'zipCode')).toHaveAccessibleDescription(
            hr.forms.serverFieldErrors.invalid,
        )
    })

    it('shows a server error above the fields and keeps the input', async () => {
        server.use(
            http.post(apiUrl('/privileged-owners'), () => new HttpResponse(null, { status: 500 })),
        )
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, newOwner)
        await save(rendered, form)

        const alert = await within(form).findByRole('alert')
        expect(alert).toHaveTextContent(`${hr.forms.saveFailed} ${hr.forms.errors.server}`)
        await waitFor(() => {
            expect(alert).toHaveFocus()
        })
        expect(field(form, 'ownerName')).toHaveValue('Ivana Horvat')
    })

    it('keeps Spremi off on an edit until a value differs from the stored one', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openEditForm(rendered, 'ZG1234AB')
        const saveButton = within(form).getByRole('button', { name: hr.forms.save })
        expect(saveButton).toBeDisabled()

        await rendered.user.type(field(form, 'city'), 'X')

        expect(saveButton).toBeEnabled()
    })

    it('asks before discarding changes, and returns focus to the edit button on close', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openEditForm(rendered, 'ZG1234AB')
        await rendered.user.type(field(form, 'ownerName'), ' ml.')

        await rendered.user.click(within(form).getByRole('button', { name: hr.forms.close }))
        const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.confirm }),
        )

        await expectFormClosed()
        const table = screen.getByRole('table', { name: t.listLabel })
        expect(within(table).getByRole('button', { name: t.editOwner('ZG1234AB') })).toHaveFocus()
        expect(within(table).getByRole('cell', { name: 'Josip Babić' })).toBeInTheDocument()
    })

    it('opens the edit form from a card on a phone, and adds from the icon button', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.privilegedOwners)
        const list = await screen.findByRole('list', { name: t.listLabel })

        await rendered.user.click(
            within(list).getByRole('button', { name: t.editOwner('ZG9087KL') }),
        )
        const form = await openedForm(t.editOwner('ZG9087KL'))
        expect(field(form, 'plate')).toHaveValue('ZG9087KL')
        await rendered.user.click(within(form).getByRole('button', { name: hr.forms.close }))
        await expectFormClosed()

        await rendered.user.click(screen.getByRole('button', { name: t.addLong }))

        expect(await openedForm(t.addLong)).toBeInTheDocument()
    })

    it('has no axe violations with the form open and showing errors', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const form = await openAddForm(rendered)
        await save(rendered, form)
        await waitFor(() => {
            expect(field(form, 'plate')).toBeInvalid()
        })

        await expectNoAxeViolations(document.body)
    })

    it('has no axe violations editing an expired entry', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        await openEditForm(rendered, 'ZG9087KL')

        await expectNoAxeViolations(document.body)
    })
})
