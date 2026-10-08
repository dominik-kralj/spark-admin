import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { apiUrl } from '@/mocks/url'
import { request } from '@/shared/api'
import { hr } from '@/shared/i18n/hr'
import { toaster } from '@/shared/lib/toaster'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { giveElementsLayout } from '@/test/layout'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'
import { setViewportWidth } from '@/test/viewport'

const { delete: deleteStrings } = hr.zones

async function zonesTable() {
    return screen.findByRole('table', { name: hr.zones.listLabel })
}

/** Resolves once focus is on Odustani, as it is by the time a person can act. */
async function confirmDialog(code: string) {
    const dialog = await screen.findByRole('alertdialog', { name: deleteStrings.title(code) })
    await waitFor(() => {
        expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toHaveFocus()
    })

    return dialog
}

async function openDeleteFromRow({ user }: RenderedRoute, code: string) {
    const table = await zonesTable()
    const deleteButton = within(table).getByRole('button', { name: deleteStrings.deleteZone(code) })
    await user.click(deleteButton)

    return { deleteButton, dialog: await confirmDialog(code) }
}

/** Counts DELETE requests; the mock still answers them. */
function countDeletes(): { count: number } {
    const calls = { count: 0 }
    server.use(
        http.delete(apiUrl('/zones/:zoneId'), () => {
            calls.count += 1
        }),
    )

    return calls
}

describe('Zone delete', () => {
    beforeEach(() => {
        signInForTest()
        giveElementsLayout()
    })

    // The toaster's store outlives each render; its toasts would carry into the next test.
    afterEach(() => {
        toaster.remove()
    })

    it('asks by naming the zone, with focus on Odustani', async () => {
        const rendered = await renderRoute(paths.zones)

        const { dialog } = await openDeleteFromRow(rendered, 'ZONA1')

        expect(dialog).toHaveAccessibleDescription(deleteStrings.description('ZONA1', 'Prva zona'))
        expect(within(dialog).getByRole('button', { name: deleteStrings.confirm })).toBeEnabled()
    })

    it('keeps the zone on Odustani and returns focus to the delete button', async () => {
        const calls = countDeletes()
        const rendered = await renderRoute(paths.zones)
        const { deleteButton, dialog } = await openDeleteFromRow(rendered, 'ZONA1')

        await rendered.user.click(within(dialog).getByRole('button', { name: hr.forms.cancel }))

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(deleteButton).toHaveFocus()
        expect(within(await zonesTable()).getByRole('cell', { name: 'ZONA1' })).toBeInTheDocument()
        expect(calls.count).toBe(0)
    })

    it('deletes on confirm: the row goes, a toast says so, focus moves to Dodaj zonu', async () => {
        const rendered = await renderRoute(paths.zones)
        const { dialog } = await openDeleteFromRow(rendered, 'ZONA1')

        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        const table = await zonesTable()
        expect(within(table).queryByRole('cell', { name: 'ZONA1' })).not.toBeInTheDocument()
        expect(screen.getByText(hr.zones.total(1))).toBeInTheDocument()
        expect(await screen.findByText(deleteStrings.deleted('ZONA1'))).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByRole('button', { name: hr.zones.add })).toHaveFocus()
        })
    })

    it('returns focus to the Uredi button of a form opened after a delete', async () => {
        const rendered = await renderRoute(paths.zones)
        const { dialog } = await openDeleteFromRow(rendered, 'ZONA1')
        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )
        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })

        const table = await zonesTable()
        const editButton = within(table).getByRole('button', { name: hr.zones.editZone('2A') })
        await rendered.user.click(editButton)
        const form = await screen.findByRole('dialog', { name: hr.zones.editZone('2A') })
        await rendered.user.click(within(form).getByRole('button', { name: hr.forms.close }))

        await waitFor(() => {
            expect(editButton).toHaveFocus()
        })
    })

    it('treats a zone someone else deleted as deleted, and refreshes the list', async () => {
        const rendered = await renderRoute(paths.zones)
        const { dialog } = await openDeleteFromRow(rendered, 'ZONA1')
        await request('/zones/1', { method: 'DELETE', schema: z.undefined() })

        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        const table = await zonesTable()
        await waitFor(() => {
            expect(within(table).queryByRole('cell', { name: 'ZONA1' })).not.toBeInTheDocument()
        })
    })

    it('sends one request however often the confirm button is pressed', async () => {
        const calls = countDeletes()
        server.use(
            http.delete(apiUrl('/zones/:zoneId'), async () => {
                await delay(200)
            }),
        )
        const rendered = await renderRoute(paths.zones)
        const { dialog } = await openDeleteFromRow(rendered, 'ZONA1')
        const confirm = within(dialog).getByRole('button', { name: deleteStrings.confirm })

        await rendered.user.click(confirm)
        await rendered.user.click(confirm)
        await rendered.user.keyboard('{Enter}')

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(calls.count).toBe(1)
    })

    it('keeps the dialog open with the reason when the delete fails', async () => {
        server.use(
            http.delete(apiUrl('/zones/:zoneId'), () => new HttpResponse(null, { status: 500 })),
        )
        const rendered = await renderRoute(paths.zones)
        const { dialog } = await openDeleteFromRow(rendered, 'ZONA1')

        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        const alert = await within(dialog).findByRole('alert')
        expect(alert).toHaveTextContent(`${deleteStrings.failed} ${deleteStrings.errors.server}`)
        expect(within(dialog).getByRole('button', { name: deleteStrings.confirm })).toBeEnabled()
        // The list behind the open dialog is hidden from assistive tech, so query it hidden.
        expect(screen.getByRole('cell', { name: 'ZONA1', hidden: true })).toBeInTheDocument()
    })

    it('deletes from the edit form, without asking about unsaved changes', async () => {
        const rendered = await renderRoute(paths.zones)
        const table = await zonesTable()
        await rendered.user.click(
            within(table).getByRole('button', { name: hr.zones.editZone('ZONA1') }),
        )
        const form = await screen.findByRole('dialog', { name: hr.zones.editZone('ZONA1') })
        await rendered.user.type(
            within(form).getByRole('textbox', { name: hr.zones.form.labels.name }),
            ' B',
        )

        await rendered.user.click(
            within(form).getByRole('button', { name: deleteStrings.formButton }),
        )
        const dialog = await confirmDialog('ZONA1')
        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        expect(within(table).queryByRole('cell', { name: 'ZONA1' })).not.toBeInTheDocument()
        expect(await screen.findByText(deleteStrings.deleted('ZONA1'))).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByRole('button', { name: hr.zones.add })).toHaveFocus()
        })
    })

    it('has no delete button in the add form', async () => {
        const rendered = await renderRoute(paths.zones)

        await rendered.user.click(await screen.findByRole('button', { name: hr.zones.add }))

        const form = await screen.findByRole('dialog', { name: hr.zones.add })
        expect(
            within(form).queryByRole('button', { name: deleteStrings.formButton }),
        ).not.toBeInTheDocument()
    })

    it('deletes from a card on a phone', async () => {
        setViewportWidth(375)
        const rendered = await renderRoute(paths.zones)
        const list = await screen.findByRole('list', { name: hr.zones.listLabel })

        await rendered.user.click(
            within(list).getByRole('button', { name: deleteStrings.deleteZone('2A') }),
        )
        const dialog = await confirmDialog('2A')
        await rendered.user.click(
            within(dialog).getByRole('button', { name: deleteStrings.confirm }),
        )

        await waitFor(() => {
            expect(within(list).getAllByRole('listitem')).toHaveLength(1)
        })
    })

    it('has no axe violations with the dialog open', async () => {
        const rendered = await renderRoute(paths.zones)
        await openDeleteFromRow(rendered, 'ZONA1')

        await expectNoAxeViolations(document.body)
    })
})
