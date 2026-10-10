import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockTicketIds } from '@/mocks/tickets'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { giveElementsLayout } from '@/test/layout'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.tickets.detail

const detailPath = (id: string) => `${paths.tickets}/${id}`

async function findDrawer(plate: string) {
    return screen.findByRole('dialog', { name: t.title(plate) })
}

/** Each label and its value, in order, from the drawer's description lists. */
function fieldValues(drawer: HTMLElement): [string, string][] {
    return within(drawer)
        .getAllByRole('term')
        .map((term) => [term.textContent, term.nextElementSibling?.textContent ?? ''])
}

async function tableLink(plate: string) {
    const table = await screen.findByRole('table', { name: hr.tickets.listLabel })

    return within(table).getByRole('link', { name: plate })
}

describe('Karte detail', () => {
    beforeEach(() => {
        signInForTest()
    })

    // With layout, both the table's and the card's row link count as on screen.
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('opens from a table row with every field formatted', async () => {
        giveElementsLayout()
        const { user, router } = await renderRoute(paths.tickets)

        await user.click(await tableLink('ZG1234AB'))

        const drawer = await findDrawer('ZG1234AB')
        expect(router.state.location.pathname).toBe(detailPath(mockTicketIds.newest))
        await waitFor(() => {
            expect(within(drawer).getByRole('heading', { level: 2 })).toHaveFocus()
        })
        expect(
            within(drawer)
                .getAllByRole('heading', { level: 3 })
                .map((heading) => heading.textContent),
        ).toEqual([t.ticketSection, t.transactionSection])
        expect(fieldValues(drawer)).toEqual([
            ['Plaćanje', 'Plaćeno'],
            ['Fiskalizacija', 'Fiskalizirano'],
            ['Registracija', 'ZG1234AB'],
            ['Zona', 'ZONA1'],
            ['Vrijeme kupnje', '06.10.2026 09:14'],
            ['Vrijedi do', '06.10.2026 10:14'],
            ['Trajanje', '60 min'],
            ['Iznos', '0,70 EUR'],
            ['Osnovica', '0,56 EUR'],
            ['Stopa PDV-a', '25 %'],
            ['Iznos PDV-a', '0,14 EUR'],
            ['Broj transakcije', '100300'],
            ['JIR', expect.stringMatching(/^[\da-f-]{36}$/) as string],
            ['ZKI', expect.stringMatching(/^[\da-f]{32}$/) as string],
            ['Vrijeme fiskalizacije', '06.10.2026 09:14'],
        ])
        for (const name of [t.copy.transactionId, t.copy.jir, t.copy.zki]) {
            expect(within(drawer).getByRole('button', { name })).toBeInTheDocument()
        }
    })

    it('copies the JIR', async () => {
        const { user } = await renderRoute(detailPath(mockTicketIds.newest))
        const drawer = await findDrawer('ZG1234AB')
        const jir = fieldValues(drawer).find(([label]) => label === 'JIR')?.[1]

        await user.click(within(drawer).getByRole('button', { name: t.copy.jir }))

        expect(await navigator.clipboard.readText()).toBe(jir)
    })

    it('closes with Escape, back to the same list page, and returns focus to the row', async () => {
        const { user, router } = await renderRoute(`${paths.tickets}?page=2`)
        const table = await screen.findByRole('table', { name: hr.tickets.listLabel })
        const [link] = within(table).getAllByRole('link')
        if (link === undefined) throw new Error('Expected a ticket link on page 2')

        await user.click(link)
        await findDrawer(link.textContent)
        expect(router.state.location.search).toBe('?page=2')
        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(router.state.location.pathname).toBe(paths.tickets)
        expect(router.state.location.search).toBe('?page=2')
        await waitFor(() => {
            expect(link).toHaveFocus()
        })
    })

    it('opens from a card on a phone, and the back arrow closes it', async () => {
        const { user, router } = await renderRoute(paths.tickets)
        const list = await screen.findByRole('list', { name: hr.tickets.listLabel })
        const cardLink = within(list).getByRole('link', { name: /ZG5553AI/ })

        await user.click(cardLink)
        const drawer = await findDrawer('ZG5553AI')
        await user.click(within(drawer).getByRole('button', { name: t.back }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(router.state.location.pathname).toBe(paths.tickets)
        await waitFor(() => {
            expect(cardLink).toHaveFocus()
        })
    })

    it('opens straight from a link, over the list, and closes to the list', async () => {
        const { user, router } = await renderRoute(detailPath(mockTicketIds.newest))

        const drawer = await findDrawer('ZG1234AB')
        await user.click(within(drawer).getByRole('button', { name: t.close }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(router.state.location.pathname).toBe(paths.tickets)
        expect(await tableLink('ZG1234AB')).toBeInTheDocument()
    })

    it('shows a dash for each missing value, never "null"', async () => {
        const { user } = await renderRoute(paths.tickets)

        await user.click(await tableLink('ZG9087KL'))

        const drawer = await findDrawer('ZG9087KL')
        const missing = fieldValues(drawer).filter(([label]) =>
            ['JIR', 'ZKI', 'Vrijeme fiskalizacije'].includes(label),
        )
        expect(missing).toEqual([
            ['JIR', `–${hr.details.missing}`],
            ['ZKI', `–${hr.details.missing}`],
            ['Vrijeme fiskalizacije', `–${hr.details.missing}`],
        ])
        expect(drawer).not.toHaveTextContent(/null|undefined/)
        expect(within(drawer).queryByRole('button', { name: t.copy.jir })).not.toBeInTheDocument()
        expect(within(drawer).queryByRole('button', { name: t.copy.zki })).not.toBeInTheDocument()
    })

    it("shows the fiscal service's error text on a failed ticket", async () => {
        await renderRoute(detailPath(mockTicketIds.fiscalFailed))

        const drawer = await findDrawer('KA4410CD')
        const fiscalError = fieldValues(drawer).find(([label]) => label === t.fields.fiscalError)

        expect(fiscalError?.[1]).toMatch(/Porezna uprava/)
        expect(fieldValues(drawer)[1]).toEqual(['Fiskalizacija', 'Neuspjelo'])
    })

    it('says when the ticket does not exist', async () => {
        const { container } = await renderRoute(detailPath('nepostojeca-karta'))

        const drawer = await screen.findByRole('dialog', { name: t.fallbackTitle })
        expect(
            await within(drawer).findByRole('heading', { level: 2, name: t.notFound.title }),
        ).toBeInTheDocument()
        expect(within(drawer).getByText(t.notFound.description)).toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/tickets/:ticketId'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user } = await renderRoute(detailPath(mockTicketIds.newest))

        const drawer = await screen.findByRole('dialog', { name: t.fallbackTitle })
        const alert = await within(drawer).findByRole('alert')
        expect(within(alert).getByRole('heading', { name: t.errorTitle })).toBeInTheDocument()

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await findDrawer('ZG1234AB')).toBeInTheDocument()
    })

    it('has no axe violations with a ticket open', async () => {
        const { container } = await renderRoute(detailPath(mockTicketIds.newest))
        await findDrawer('ZG1234AB')

        await expectNoAxeViolations(container)
    })
})
