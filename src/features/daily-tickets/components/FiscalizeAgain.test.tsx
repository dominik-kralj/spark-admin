import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockDailyTicketIds } from '@/mocks/dailyTickets'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { giveElementsLayout } from '@/test/layout'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.dailyTickets
const s = t.fiscalize
const fiscalizePath = '/daily-tickets/:ticketId/fiscalize'

async function dailyTicketsTable() {
    return screen.findByRole('table', { name: t.listLabel }, { timeout: 5000 })
}

function rowOf(table: HTMLElement, plate: string): HTMLElement {
    const row = within(table).getByRole('link', { name: plate }).closest('tr')
    if (row === null) throw new Error(`Expected a row for ${plate}`)

    return row
}

// From the DOM: while the confirm dialog is open, the page behind it is hidden from roles.
function statusIn(row: HTMLElement) {
    return [...row.querySelectorAll('td')].at(-2)?.textContent
}

async function confirmDialog(plate: string) {
    return screen.findByRole('alertdialog', { name: s.confirmTitle(plate) })
}

/** Counts fiscalize requests; each waits until `release` is called. */
function holdFiscalizeRequests() {
    const counter = {
        count: 0,
        release: () => {
            // Replaced once the promise below exists.
        },
    }
    const released = new Promise<void>((resolve) => {
        counter.release = resolve
    })
    server.use(
        http.post(apiUrl(fiscalizePath), async () => {
            counter.count += 1
            await released

            // Falls through to the mock's own handler.
            return undefined
        }),
    )

    return counter
}

describe('DPK fiscalize again', () => {
    beforeEach(() => {
        signInForTest()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('is offered on failed rows and cards only', async () => {
        await renderRoute(paths.dailyTickets)
        const table = await dailyTicketsTable()
        const list = screen.getByRole('list', { name: t.listLabel })

        const failedPlates = within(table)
            .getAllByRole('row')
            .slice(1)
            .filter((row) => statusIn(row) === hr.processingStatus.fiscal.failed)
            .map((row) => within(row).getAllByRole('link')[0]?.textContent)
        const rowButtons = within(table).getAllByRole('button', { name: /^Fiskaliziraj ponovno/ })
        const cardButtons = within(list).getAllByRole('button', { name: /^Fiskaliziraj ponovno/ })

        expect(failedPlates).toEqual(expect.arrayContaining(['ZG9087KL', 'ZG6140TR']))
        expect(rowButtons.map((button) => button.getAttribute('aria-label'))).toEqual(
            failedPlates.map((plate) => s.actionFor(plate ?? '')),
        )
        expect(cardButtons).toHaveLength(failedPlates.length)
    })

    it('fiscalizes a failed row after confirming, and the row shows the new status', async () => {
        giveElementsLayout()
        const { user } = await renderRoute(paths.dailyTickets)
        const table = await dailyTicketsTable()

        await user.click(within(rowOf(table, 'ZG9087KL')).getByRole('button'))
        const dialog = await confirmDialog('ZG9087KL')
        expect(within(dialog).getByText(s.confirmDescription)).toBeInTheDocument()
        await user.click(within(dialog).getByRole('button', { name: s.action }))

        expect(await screen.findByText(s.done('ZG9087KL'))).toBeInTheDocument()
        await waitFor(() => {
            expect(statusIn(rowOf(table, 'ZG9087KL'))).toBe(hr.processingStatus.fiscal.done)
        })
        expect(within(rowOf(table, 'ZG9087KL')).queryByRole('button')).not.toBeInTheDocument()
        // The button is gone, so focus goes to the row's link.
        await waitFor(() => {
            expect(within(table).getByRole('link', { name: 'ZG9087KL' })).toHaveFocus()
        })
    })

    it('shows U obradi while it runs, and sends one request however often it is pressed', async () => {
        const requests = holdFiscalizeRequests()
        const { user } = await renderRoute(paths.dailyTickets)
        const row = rowOf(await dailyTicketsTable(), 'ZG9087KL')
        const retry = within(row).getByRole('button')

        await user.click(retry)
        const dialog = await confirmDialog('ZG9087KL')
        const confirm = within(dialog).getByRole('button', { name: s.action })
        await user.dblClick(confirm)

        await waitFor(() => {
            expect(statusIn(row)).toBe(hr.processingStatus.fiscal.processing)
        })
        expect(confirm).toBeDisabled()
        expect(within(dialog).getByRole('button', { name: hr.forms.cancel })).toBeDisabled()
        expect(retry).toBeDisabled()
        expect(requests.count).toBe(1)

        requests.release()

        expect(await screen.findByText(s.done('ZG9087KL'))).toBeInTheDocument()
        expect(requests.count).toBe(1)
    })

    it('keeps the ticket failed and explains when the tax authority fails again', async () => {
        giveElementsLayout()
        const { user } = await renderRoute(paths.dailyTickets)
        const table = await dailyTicketsTable()
        const retry = within(rowOf(table, 'ZG6140TR')).getByRole('button')

        await user.click(retry)
        await user.click(
            within(await confirmDialog('ZG6140TR')).getByRole('button', { name: s.action }),
        )

        expect(await screen.findByText(s.failedAgain('ZG6140TR'))).toBeInTheDocument()
        expect(screen.getByText(s.failedAgainDescription)).toBeInTheDocument()
        expect(statusIn(rowOf(table, 'ZG6140TR'))).toBe(hr.processingStatus.fiscal.failed)
        await waitFor(() => {
            expect(retry).toHaveFocus()
        })
    })

    it('says why in the dialog when the request fails, and changes nothing', async () => {
        server.use(
            http.post(apiUrl(fiscalizePath), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user } = await renderRoute(paths.dailyTickets)
        const row = rowOf(await dailyTicketsTable(), 'ZG9087KL')

        await user.click(within(row).getByRole('button'))
        const dialog = await confirmDialog('ZG9087KL')
        await user.click(within(dialog).getByRole('button', { name: s.action }))

        const alert = await within(dialog).findByRole('alert')
        expect(alert).toHaveTextContent(s.failed)
        expect(alert).toHaveTextContent(s.errors.server)
        expect(statusIn(row)).toBe(hr.processingStatus.fiscal.failed)

        await user.click(within(dialog).getByRole('button', { name: hr.forms.cancel }))

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
    })

    it('refreshes the row when someone else fiscalized it first', async () => {
        server.use(
            http.post(
                apiUrl(fiscalizePath),
                () =>
                    HttpResponse.json({ status: 409, code: 'alreadyFiscalized' }, { status: 409 }),
                { once: true },
            ),
        )
        const { user } = await renderRoute(paths.dailyTickets)
        const table = await dailyTicketsTable()

        await user.click(within(rowOf(table, 'ZG9087KL')).getByRole('button'))
        const dialog = await confirmDialog('ZG9087KL')
        await user.click(within(dialog).getByRole('button', { name: s.action }))

        expect(await within(dialog).findByRole('alert')).toHaveTextContent(s.errors.conflict)
    })

    it('fiscalizes from the detail, and the detail and the list agree after', async () => {
        giveElementsLayout()
        const { user } = await renderRoute(`${paths.dailyTickets}/${mockDailyTicketIds.failed}`)
        const drawer = await screen.findByRole('dialog', { name: t.detail.title('ZG9087KL') })

        await user.click(within(drawer).getByRole('button', { name: s.actionFor('ZG9087KL') }))
        await user.click(
            within(await confirmDialog('ZG9087KL')).getByRole('button', { name: s.action }),
        )

        expect(await screen.findByText(s.done('ZG9087KL'))).toBeInTheDocument()
        await waitFor(() => {
            expect(within(drawer).queryByText(t.detail.failure.title)).not.toBeInTheDocument()
        })
        expect(within(drawer).getByText(hr.processingStatus.fiscal.done)).toBeInTheDocument()
        expect(within(drawer).queryByText(t.detail.jirMissing)).not.toBeInTheDocument()
        await waitFor(() => {
            expect(within(drawer).getByRole('heading', { level: 2 })).toHaveFocus()
        })

        // The list behind the drawer already shows it, hidden from roles while the drawer is open.
        const table = screen.getByRole('table', { name: t.listLabel, hidden: true })
        const link = within(table).getByRole('link', { name: 'ZG9087KL', hidden: true })
        const row = link.closest('tr')
        if (row === null) throw new Error('Expected the row for ZG9087KL')
        expect(statusIn(row)).toBe(hr.processingStatus.fiscal.done)
    })

    it('has no axe violations with the confirm dialog open', async () => {
        const { user, container } = await renderRoute(paths.dailyTickets)
        const table = await dailyTicketsTable()

        await user.click(within(rowOf(table, 'ZG9087KL')).getByRole('button'))
        await confirmDialog('ZG9087KL')

        await expectNoAxeViolations(container)
    })
})
