import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { giveElementsLayout } from '@/test/layout'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'
import { setViewportWidth } from '@/test/viewport'

const t = hr.adminUsers
const { labels } = t.form

type TextLabel = 'username' | 'name' | 'surname'

type PasswordLabel = 'password' | 'confirmPassword' | 'newPassword' | 'confirmNewPassword'

const newUser: Record<TextLabel | 'password' | 'confirmPassword', string> = {
    username: 'iva.maric',
    name: 'Iva',
    surname: 'Marić',
    password: 'lozinka123',
    confirmPassword: 'lozinka123',
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

async function openEditForm({ user }: RenderedRoute, username: string) {
    const table = await screen.findByRole('table', { name: t.listLabel })
    await user.click(within(table).getByRole('button', { name: t.editAdminUser(username) }))

    return openedForm(t.editAdminUser(username))
}

function field(form: HTMLElement, label: TextLabel) {
    return within(form).getByRole('textbox', { name: labels[label] })
}

// A password input has no role; its label still names it.
function passwordField(form: HTMLElement, label: PasswordLabel = 'password') {
    return within(form).getByLabelText(labels[label])
}

async function fillForm(
    rendered: RenderedRoute,
    form: HTMLElement,
    values: Partial<typeof newUser>,
) {
    for (const [label, value] of Object.entries(values) as [keyof typeof newUser, string][]) {
        const input =
            label === 'password' || label === 'confirmPassword'
                ? passwordField(form, label)
                : field(form, label)
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

describe('Admin user form', () => {
    beforeEach(() => {
        signInForTest()
        giveElementsLayout()
    })

    it('adds a user: the right payload, a toast, and the row', async () => {
        const bodies = captureBodies('post', '/users')
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        expect(within(form).getByText(t.form.intro)).toBeInTheDocument()

        await fillForm(rendered, form, { ...newUser, name: ' Iva ' })
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([
            { username: 'iva.maric', name: 'Iva', surname: 'Marić', password: 'lozinka123' },
        ])
        expect(await screen.findByText(t.form.saved('iva.maric'))).toBeInTheDocument()
        const table = screen.getByRole('table', { name: t.listLabel })
        expect(await within(table).findByRole('cell', { name: 'Iva Marić' })).toBeInTheDocument()
    })

    it('masks the password as a new one, and its button shows and hides it', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        const password = passwordField(form)
        const toggle = within(form).getByRole('button', { name: t.form.showPassword })
        expect(passwordField(form, 'confirmPassword')).toHaveAttribute('type', 'password')
        expect(passwordField(form, 'confirmPassword')).toHaveAttribute(
            'autocomplete',
            'new-password',
        )
        expect(
            within(form).getByRole('button', { name: t.form.showConfirmPassword }),
        ).toHaveAttribute('aria-pressed', 'false')
        expect(password).toHaveAttribute('type', 'password')
        expect(password).toHaveAttribute('autocomplete', 'new-password')
        expect(password).toHaveAccessibleDescription(t.form.passwordHelp)
        expect(toggle).toHaveAttribute('aria-pressed', 'false')

        await rendered.user.click(toggle)

        expect(password).toHaveAttribute('type', 'text')
        expect(toggle).toHaveAttribute('aria-pressed', 'true')

        await rendered.user.click(toggle)

        expect(password).toHaveAttribute('type', 'password')
    })

    it('checks a field when it is left', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        const username = field(form, 'username')

        await rendered.user.click(username)
        await rendered.user.tab()

        expect(username).toBeInvalid()
        expect(username).toHaveAccessibleDescription(hr.forms.validation.required)

        await rendered.user.type(username, 'iva')

        expect(username).toBeValid()
    })

    it('limits names to 100 characters', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, { surname: 'a'.repeat(101) })
        await rendered.user.tab()

        expect(field(form, 'surname')).toHaveAccessibleDescription(hr.forms.tooLong(100))
    })

    it('keeps Spremi off on a new user until something is typed', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        const saveButton = within(form).getByRole('button', { name: hr.forms.save })
        expect(saveButton).toBeDisabled()

        await rendered.user.type(field(form, 'name'), 'Iva')

        expect(saveButton).toBeEnabled()
    })

    it('sends nothing on a save with invalid fields, marks each one and focuses the first', async () => {
        const bodies = captureBodies('post', '/users')
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        await rendered.user.type(field(form, 'surname'), 'Marić')

        await save(rendered, form)

        expect(within(form).queryByRole('alert')).not.toBeInTheDocument()
        expect(bodies).toEqual([])
        await waitFor(() => {
            expect(field(form, 'username')).toHaveFocus()
        })
        expect(field(form, 'name')).toHaveAccessibleDescription(hr.forms.validation.required)
        expect(passwordField(form)).toHaveAccessibleDescription(
            `${t.form.passwordHelp} ${hr.forms.validation.required}`,
        )
        expect(passwordField(form, 'confirmPassword')).toHaveAccessibleDescription(
            hr.forms.validation.required,
        )
    })

    it('says when the repeated password differs, as soon as it is left', async () => {
        const bodies = captureBodies('post', '/users')
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        const confirm = passwordField(form, 'confirmPassword')

        await fillForm(rendered, form, { password: 'lozinka123', confirmPassword: 'lozinka124' })
        await rendered.user.tab()

        expect(confirm).toBeInvalid()
        expect(confirm).toHaveAccessibleDescription(hr.forms.validation.passwordMismatch)

        await fillForm(rendered, form, { ...newUser, confirmPassword: 'lozinka124' })
        await save(rendered, form)

        expect(bodies).toEqual([])
        await waitFor(() => {
            expect(confirm).toHaveFocus()
        })

        await fillForm(rendered, form, { password: 'lozinka124' })

        await waitFor(() => {
            expect(confirm).toBeValid()
        })
    })

    it('puts a duplicate username from the server on the username field', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, { ...newUser, username: 'marin.loncar' })
        await save(rendered, form)

        await waitFor(() => {
            expect(field(form, 'username')).toHaveFocus()
        })
        expect(field(form, 'username')).toHaveAccessibleDescription(t.form.duplicateUsername)
    })

    it('shows a server error above the fields and keeps the input', async () => {
        server.use(http.post(apiUrl('/users'), () => new HttpResponse(null, { status: 500 })))
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)

        await fillForm(rendered, form, newUser)
        await save(rendered, form)

        const alert = await within(form).findByRole('alert')
        expect(alert).toHaveTextContent(`${hr.forms.saveFailed} ${hr.forms.errors.server}`)
        await waitFor(() => {
            expect(alert).toHaveFocus()
        })
        expect(field(form, 'surname')).toHaveValue('Marić')
    })

    it('edits a user: username fixed, password empty and left out of the payload', async () => {
        const bodies = captureBodies('put', '/users/:adminUserId')
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openEditForm(rendered, 'marin.loncar')

        expect(within(form).getByText(t.form.editIntro)).toBeInTheDocument()
        const username = field(form, 'username')
        expect(username).toHaveValue('marin.loncar')
        expect(username).toHaveAttribute('readonly')
        expect(username).toHaveAccessibleDescription(t.form.usernameFixed)
        expect(field(form, 'name')).toHaveValue('Marin')
        expect(field(form, 'surname')).toHaveValue('Lončar')
        const password = passwordField(form, 'newPassword')
        expect(password).toHaveValue('')
        expect(password).toHaveAttribute('autocomplete', 'new-password')
        expect(password).toHaveAccessibleDescription(t.form.newPasswordHelp)
        expect(passwordField(form, 'confirmNewPassword')).toHaveValue('')

        await fillForm(rendered, form, { surname: 'Lončar-Horvat' })
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([{ name: 'Marin', surname: 'Lončar-Horvat' }])
        expect(await screen.findByText(t.form.saved('marin.loncar'))).toBeInTheDocument()
        const table = screen.getByRole('table', { name: t.listLabel })
        expect(
            await within(table).findByRole('cell', { name: 'Marin Lončar-Horvat' }),
        ).toBeInTheDocument()
    })

    it('sends a new password typed into the edit form', async () => {
        const bodies = captureBodies('put', '/users/:adminUserId')
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openEditForm(rendered, 'marin.loncar')

        await rendered.user.type(passwordField(form, 'newPassword'), 'nova-lozinka')
        await rendered.user.type(passwordField(form, 'confirmNewPassword'), 'nova-lozinka')
        await save(rendered, form)

        await expectFormClosed()
        expect(bodies).toEqual([{ name: 'Marin', surname: 'Lončar', password: 'nova-lozinka' }])
    })

    it('sends nothing when a new password is not repeated', async () => {
        const bodies = captureBodies('put', '/users/:adminUserId')
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openEditForm(rendered, 'marin.loncar')

        await rendered.user.type(passwordField(form, 'newPassword'), 'nova-lozinka')
        await save(rendered, form)

        expect(bodies).toEqual([])
        await waitFor(() => {
            expect(passwordField(form, 'confirmNewPassword')).toHaveFocus()
        })
        expect(passwordField(form, 'confirmNewPassword')).toHaveAccessibleDescription(
            hr.forms.validation.passwordMismatch,
        )
    })

    it('asks before discarding changes, and returns focus to the edit button on close', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openEditForm(rendered, 'sanja.klaric')
        await rendered.user.type(field(form, 'name'), 'a')

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
        const table = screen.getByRole('table', { name: t.listLabel })
        // The drawer hands focus back as its exit ends, which a full parallel run slows past 3 s.
        await waitFor(
            () => {
                expect(
                    within(table).getByRole('button', { name: t.editAdminUser('sanja.klaric') }),
                ).toHaveFocus()
            },
            { timeout: 5000 },
        )
    })

    it('keeps the edits when the user chooses to keep editing', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openEditForm(rendered, 'sanja.klaric')
        await rendered.user.type(field(form, 'name'), 'a')

        await rendered.user.click(within(form).getByRole('button', { name: hr.forms.cancel }))
        const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.keepEditing }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(field(form, 'name')).toHaveValue('Sanjaa')
    })

    it('opens the edit form from a card on a phone', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.adminUsers)
        const list = await screen.findByRole('list', { name: t.listLabel })

        await rendered.user.click(
            within(list).getByRole('button', { name: t.editAdminUser('sanja.klaric') }),
        )
        const form = await openedForm(t.editAdminUser('sanja.klaric'))
        expect(field(form, 'surname')).toHaveValue('Klarić')
    })

    it('has no axe violations with the form open and showing errors', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openAddForm(rendered)
        await rendered.user.type(field(form, 'surname'), 'Marić')
        await save(rendered, form)
        await waitFor(() => {
            expect(field(form, 'username')).toBeInvalid()
        })

        await expectNoAxeViolations(document.body)
    })

    it('has no axe violations with the edit form open', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        await openEditForm(rendered, 'marin.loncar')

        await expectNoAxeViolations(document.body)
    })
})
