import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
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
const { delete: deleteStrings } = t

async function usersTable() {
    return screen.findByRole('table', { name: t.listLabel })
}

/** Resolves once focus is on Odustani, as it is by the time a person can act. */
async function confirmDialog(username: string) {
    const dialog = await screen.findByRole('alertdialog', { name: deleteStrings.title(username) })
    await waitFor(() => {
        expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toHaveFocus()
    })

    return dialog
}

async function openDeleteFromRow({ user }: RenderedRoute, username: string) {
    const table = await usersTable()
    const deleteButton = within(table).getByRole('button', {
        name: deleteStrings.deleteAdminUser(username),
    })
    await user.click(deleteButton)

    return { deleteButton, dialog: await confirmDialog(username) }
}

async function openEditForm({ user }: RenderedRoute, username: string) {
    const table = await usersTable()
    await user.click(within(table).getByRole('button', { name: t.editAdminUser(username) }))

    return screen.findByRole('dialog', { name: t.editAdminUser(username) })
}

async function confirm({ user }: RenderedRoute, dialog: HTMLElement) {
    await user.click(within(dialog).getByRole('button', { name: deleteStrings.confirm }))
}

/** Counts DELETE requests; the mock still answers them. */
function countDeletes(): { count: number } {
    const calls = { count: 0 }
    server.use(
        http.delete(apiUrl('/users/:adminUserId'), () => {
            calls.count += 1
        }),
    )

    return calls
}

describe('Admin user delete', () => {
    beforeEach(() => {
        signInForTest()
        giveElementsLayout()
    })

    it('offers a delete on every row but the signed-in user’s', async () => {
        await renderRoute(paths.adminUsers)
        const table = await usersTable()

        expect(
            within(table)
                .getAllByRole('button', { name: /^Obriši korisnika / })
                .map((button) => button.getAttribute('aria-label')),
        ).toEqual([
            deleteStrings.deleteAdminUser('marin.loncar'),
            deleteStrings.deleteAdminUser('sanja.klaric'),
        ])
    })

    it('asks by naming the user, with focus on Odustani', async () => {
        const rendered = await renderRoute(paths.adminUsers)

        const { dialog } = await openDeleteFromRow(rendered, 'marin.loncar')

        expect(dialog).toHaveAccessibleDescription(deleteStrings.description('marin.loncar'))
        expect(within(dialog).getByRole('button', { name: deleteStrings.confirm })).toBeEnabled()
    })

    it('keeps the user on Odustani and returns focus to the delete button', async () => {
        const calls = countDeletes()
        const rendered = await renderRoute(paths.adminUsers)
        const { deleteButton, dialog } = await openDeleteFromRow(rendered, 'marin.loncar')

        await rendered.user.click(within(dialog).getByRole('button', { name: hr.forms.cancel }))

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(deleteButton).toHaveFocus()
        expect(calls.count).toBe(0)
    })

    it('deletes on confirm: the row goes, a toast says so, focus moves to Dodaj korisnika', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const { dialog } = await openDeleteFromRow(rendered, 'marin.loncar')

        await confirm(rendered, dialog)

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        const table = await usersTable()
        await waitFor(() => {
            expect(within(table).queryByText('marin.loncar')).not.toBeInTheDocument()
        })
        expect(screen.getByText(t.total(2))).toBeInTheDocument()
        expect(await screen.findByText(deleteStrings.deleted('marin.loncar'))).toBeInTheDocument()
        await waitFor(() => {
            // Tests start at a desktop width, where the text button is the one on screen.
            expect(screen.getAllByRole('button', { name: t.add })[0]).toHaveFocus()
        })
    })

    it('sends one request however often the confirm button is pressed', async () => {
        const calls = countDeletes()
        server.use(
            http.delete(apiUrl('/users/:adminUserId'), async () => {
                await delay(200)
            }),
        )
        const rendered = await renderRoute(paths.adminUsers)
        const { dialog } = await openDeleteFromRow(rendered, 'marin.loncar')

        await confirm(rendered, dialog)
        await confirm(rendered, dialog)

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(calls.count).toBe(1)
    })

    it('says why when the server refuses to delete the signed-in user', async () => {
        server.use(
            http.delete(apiUrl('/users/:adminUserId'), () =>
                HttpResponse.json({ status: 409, code: 'cannotDeleteSelf' }, { status: 409 }),
            ),
        )
        const rendered = await renderRoute(paths.adminUsers)
        const { dialog } = await openDeleteFromRow(rendered, 'marin.loncar')

        await confirm(rendered, dialog)

        const alert = await within(dialog).findByRole('alert')
        expect(alert).toHaveTextContent(`${deleteStrings.failed} ${deleteStrings.errors.conflict}`)
    })

    it('keeps the dialog open with the reason when the delete fails', async () => {
        server.use(
            http.delete(
                apiUrl('/users/:adminUserId'),
                () => new HttpResponse(null, { status: 500 }),
            ),
        )
        const rendered = await renderRoute(paths.adminUsers)
        const { dialog } = await openDeleteFromRow(rendered, 'marin.loncar')

        await confirm(rendered, dialog)

        const alert = await within(dialog).findByRole('alert')
        expect(alert).toHaveTextContent(`${deleteStrings.failed} ${deleteStrings.errors.server}`)
        expect(within(dialog).getByRole('button', { name: deleteStrings.confirm })).toBeEnabled()
    })

    it('deletes from the edit form, without asking about unsaved changes', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const form = await openEditForm(rendered, 'sanja.klaric')
        await rendered.user.type(
            within(form).getByRole('textbox', { name: t.form.labels.name }),
            'a',
        )

        await rendered.user.click(
            within(form).getByRole('button', { name: deleteStrings.formButton }),
        )
        await confirm(rendered, await confirmDialog('sanja.klaric'))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(await screen.findByText(deleteStrings.deleted('sanja.klaric'))).toBeInTheDocument()
    })

    it('has no delete in the signed-in user’s own form or in the add form', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        const ownForm = await openEditForm(rendered, 'admin')

        expect(
            within(ownForm).queryByRole('button', { name: deleteStrings.formButton }),
        ).not.toBeInTheDocument()

        await rendered.user.click(within(ownForm).getByRole('button', { name: hr.forms.close }))
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        const [addButton] = screen.getAllByRole('button', { name: t.add })
        if (addButton === undefined) throw new Error('Expected an add button')
        await rendered.user.click(addButton)
        const addForm = await screen.findByRole('dialog', { name: t.add })

        expect(
            within(addForm).queryByRole('button', { name: deleteStrings.formButton }),
        ).not.toBeInTheDocument()
    })

    it('deletes from the edit form on a phone, whose cards carry only Uredi', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.adminUsers)
        const list = await screen.findByRole('list', { name: t.listLabel })
        expect(
            within(list).queryByRole('button', { name: /^Obriši korisnika / }),
        ).not.toBeInTheDocument()

        await rendered.user.click(
            within(list).getByRole('button', { name: t.editAdminUser('sanja.klaric') }),
        )
        const form = await screen.findByRole('dialog', { name: t.editAdminUser('sanja.klaric') })
        await rendered.user.click(
            within(form).getByRole('button', { name: deleteStrings.formButton }),
        )
        await confirm(rendered, await confirmDialog('sanja.klaric'))

        await waitFor(() => {
            expect(within(list).getAllByRole('listitem')).toHaveLength(2)
        })
    })

    it('has no axe violations with the dialog open', async () => {
        const rendered = await renderRoute(paths.adminUsers)
        await openDeleteFromRow(rendered, 'marin.loncar')

        await expectNoAxeViolations(document.body)
    })
})
