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
const strings = t.delete

async function ownersTable() {
    return screen.findByRole('table', { name: t.listLabel })
}

/** Resolves once focus is on Odustani, as it is by the time a person can act. */
async function confirmDialog(plate: string) {
    const dialog = await screen.findByRole('alertdialog', { name: strings.title(plate) })
    await waitFor(() => {
        expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toHaveFocus()
    })

    return dialog
}

async function openDeleteFromRow({ user }: RenderedRoute, plate: string) {
    const table = await ownersTable()
    const deleteButton = within(table).getByRole('button', { name: strings.deleteOwner(plate) })
    await user.click(deleteButton)

    return { deleteButton, dialog: await confirmDialog(plate) }
}

describe('Privileged owner delete', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'], now: new Date('2026-10-08T10:00:00Z') })
        signInForTest()
        giveElementsLayout()
    })

    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
        vi.useRealTimers()
    })

    it('asks by naming the plate and the owner, with focus on Odustani', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)

        const { dialog } = await openDeleteFromRow(rendered, 'ZG1234AB')

        expect(dialog).toHaveAccessibleDescription(strings.description('ZG1234AB', 'Josip Babić'))
    })

    it('keeps the entry on Odustani and returns focus to the delete button', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const { deleteButton, dialog } = await openDeleteFromRow(rendered, 'ZG1234AB')

        await rendered.user.click(within(dialog).getByRole('button', { name: hr.forms.cancel }))

        await waitFor(() => {
            expect(deleteButton).toHaveFocus()
        })
        expect(within(await ownersTable()).getByRole('row', { name: /ZG1234AB/ })).toBeVisible()
    })

    it('deletes on confirm: the row goes, the counts follow, focus moves to Dodaj korisnika', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        const { dialog } = await openDeleteFromRow(rendered, 'ZG9087KL')

        await rendered.user.click(within(dialog).getByRole('button', { name: strings.confirm }))

        expect(await screen.findByText(strings.deleted('ZG9087KL'))).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByRole('tab', { name: 'Istekli (1)' })).toBeInTheDocument()
        })
        const table = await ownersTable()
        expect(within(table).queryByRole('row', { name: /ZG9087KL/ })).not.toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByRole('button', { name: t.add })).toHaveFocus()
        })
    })

    it('keeps the dialog open with the reason when the delete fails', async () => {
        server.use(
            http.delete(
                apiUrl('/privileged-owners/:id'),
                () => new HttpResponse(null, { status: 500 }),
            ),
        )
        const rendered = await renderRoute(paths.privilegedOwners)
        const { dialog } = await openDeleteFromRow(rendered, 'ZG1234AB')

        await rendered.user.click(within(dialog).getByRole('button', { name: strings.confirm }))

        const alert = await within(dialog).findByRole('alert')
        expect(alert).toHaveTextContent(`${strings.failed} ${strings.errors.server}`)
        expect(within(dialog).getByRole('button', { name: strings.confirm })).toBeEnabled()
    })

    it('deletes from the edit form on a phone, and focus moves to the add icon button', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.privilegedOwners)
        const list = await screen.findByRole('list', { name: t.listLabel })
        await rendered.user.click(
            within(list).getByRole('button', { name: t.editOwner('ZG9087KL') }),
        )
        const form = await screen.findByRole('dialog', { name: t.editOwner('ZG9087KL') })

        await rendered.user.click(within(form).getByRole('button', { name: strings.formButton }))
        const dialog = await confirmDialog('ZG9087KL')
        await rendered.user.click(within(dialog).getByRole('button', { name: strings.confirm }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(within(list).queryByText('ZG9087KL')).not.toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByRole('button', { name: t.addLong })).toHaveFocus()
        })
    })

    it('has no delete button in the add form', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        await rendered.user.click(await screen.findByRole('button', { name: t.add }))

        const form = await screen.findByRole('dialog', { name: t.addLong })

        expect(
            within(form).queryByRole('button', { name: strings.formButton }),
        ).not.toBeInTheDocument()
    })

    it('has no axe violations with the dialog open', async () => {
        const rendered = await renderRoute(paths.privilegedOwners)
        await openDeleteFromRow(rendered, 'ZG1234AB')

        await expectNoAxeViolations(document.body)
    })
})
