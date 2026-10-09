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

const t = hr.inspectors
const { delete: deleteStrings } = t

async function inspectorsTable() {
    return screen.findByRole('table', { name: t.listLabel })
}

/** Resolves once focus is on Odustani, as it is by the time a person can act. */
async function confirmDialog(name: string) {
    const dialog = await screen.findByRole('alertdialog', { name: deleteStrings.title(name) })
    await waitFor(() => {
        expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toHaveFocus()
    })

    return dialog
}

async function openDeleteFromRow({ user }: RenderedRoute, name: string) {
    const table = await inspectorsTable()
    await user.click(
        within(table).getByRole('button', { name: deleteStrings.deleteInspector(name) }),
    )

    return confirmDialog(name)
}

describe('Inspector delete', () => {
    beforeEach(() => {
        signInForTest()
        giveElementsLayout()
    })

    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
    })

    it('deletes an inspector with no tickets: the row goes, a toast says so, focus moves to Dodaj kontrolora', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const dialog = await openDeleteFromRow(rendered, 'Petra Novak')
        expect(dialog).toHaveAccessibleDescription(deleteStrings.description('Petra Novak'))

        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        const table = await inspectorsTable()
        await waitFor(() => {
            expect(within(table).queryByRole('cell', { name: 'Novak' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText(deleteStrings.deleted('Petra Novak'))).toBeInTheDocument()
        // Dodaj kontrolora: the text button from md, the icon on a phone; focus goes to the one shown.
        await waitFor(() => {
            expect(document.activeElement).toHaveAccessibleName(t.add)
        })
    })

    it('only lets an inspector who issued tickets be deactivated, and says why', async () => {
        await renderRoute(paths.inspectors)
        const table = await inspectorsTable()

        const deleteButton = within(table).getByRole('button', {
            name: deleteStrings.deleteInspector('Marko Horvat'),
        })

        expect(deleteButton).toBeDisabled()
        expect(deleteButton).toHaveAccessibleDescription(deleteStrings.onlyDeactivate(42))
        expect(
            within(table).getByRole('button', {
                name: deleteStrings.deleteInspector('Petra Novak'),
            }),
        ).toBeEnabled()
    })

    it('shows the reason as text on a phone card', async () => {
        setViewportWidth(375)
        await renderRoute(paths.inspectors)

        const list = await screen.findByRole('list', { name: t.listLabel })
        const markoCard = within(list).getByText('Marko Horvat').closest('li')
        if (markoCard === null) throw new Error('Expected a card for Marko Horvat')

        expect(
            within(markoCard).getByRole('button', {
                name: deleteStrings.deleteInspector('Marko Horvat'),
            }),
        ).toBeDisabled()
        expect(within(markoCard).getByText(deleteStrings.onlyDeactivate(42))).toBeInTheDocument()
    })

    it('deletes from the edit form, or explains there why it cannot', async () => {
        const rendered = await renderRoute(paths.inspectors)
        const table = await inspectorsTable()

        await rendered.user.click(
            within(table).getByRole('button', { name: t.editInspector('Marko Horvat') }),
        )
        const markoForm = await screen.findByRole('dialog')
        expect(
            within(markoForm).getByRole('button', { name: deleteStrings.formButton }),
        ).toBeDisabled()
        expect(within(markoForm).getByText(deleteStrings.onlyDeactivate(42))).toBeInTheDocument()
        await rendered.user.click(within(markoForm).getByRole('button', { name: hr.forms.cancel }))
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        await rendered.user.click(
            within(table).getByRole('button', { name: t.editInspector('Petra Novak') }),
        )
        const petraForm = await screen.findByRole('dialog')
        await rendered.user.click(
            within(petraForm).getByRole('button', { name: deleteStrings.formButton }),
        )
        const dialog = await confirmDialog('Petra Novak')
        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(await screen.findByText(deleteStrings.deleted('Petra Novak'))).toBeInTheDocument()
    })

    it('keeps the dialog open when the server says tickets now point at the inspector', async () => {
        server.use(
            http.delete(apiUrl('/inspectors/:inspectorId'), () =>
                HttpResponse.json({ status: 409, code: 'inUse' }, { status: 409 }),
            ),
        )
        const rendered = await renderRoute(paths.inspectors)
        const dialog = await openDeleteFromRow(rendered, 'Petra Novak')

        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        expect(await within(dialog).findByRole('alert')).toHaveTextContent(
            `${deleteStrings.failed} ${deleteStrings.errors.conflict}`,
        )
        expect(dialog).toBeInTheDocument()
    })

    it('has no axe violations with the dialog open', async () => {
        const rendered = await renderRoute(paths.inspectors)
        await openDeleteFromRow(rendered, 'Petra Novak')

        await expectNoAxeViolations(document.body)
    })
})
