import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { mockTicketIds } from '@/mocks/tickets'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.tickets

const columnHeaders = [
    'Vrijeme',
    'Registracija',
    'Zona',
    'Trajanje',
    'Iznos',
    'Vrijedi do',
    'Plaćanje',
    'Fiskalizacija',
]

async function ticketsTable() {
    return screen.findByRole('table', { name: t.listLabel })
}

function bodyRows(table: HTMLElement) {
    return within(table).getAllByRole('row').slice(1)
}

function rowCells(row: HTMLElement) {
    return within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
}

function firstPlate(table: HTMLElement) {
    return rowCells(bodyRows(table)[0] ?? table)[1]
}

function tablePages() {
    return screen.getByRole('navigation', { name: hr.pagination.tableLabel })
}

// Scoped: a whole-page text query re-scans 50 rows and cards on every DOM change.
async function findTableRange(from: number, to: number) {
    const footer = tablePages().parentElement ?? document.body

    return within(footer).findByText(t.shown(from, to, 300))
}

/** Records the query string of every list request. */
function listRequests(): URLSearchParams[] {
    const requests: URLSearchParams[] = []
    server.events.on('request:start', ({ request }) => {
        const url = new URL(request.url)
        if (url.pathname.endsWith('/tickets')) requests.push(url.searchParams)
    })

    return requests
}

describe('Karte list', () => {
    beforeEach(() => {
        signInForTest()

        return () => {
            server.events.removeAllListeners()
        }
    })

    it('has a titled page', async () => {
        await renderRoute(paths.tickets)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.tickets }),
        ).toBeInTheDocument()
        await waitFor(() => {
            expect(document.title).toBe('Karte – SPARK Admin')
        })
    })

    it('shows the newest tickets with formatted values and status as text', async () => {
        await renderRoute(paths.tickets)

        const table = await ticketsTable()
        const headers = within(table).getAllByRole('columnheader')
        expect(headers.map((header) => header.textContent)).toEqual(columnHeaders)
        expect(bodyRows(table)).toHaveLength(25)
        expect(bodyRows(table).slice(0, 2).map(rowCells)).toEqual([
            [
                '06.10.2026 09:14',
                'ZG1234AB',
                'ZONA1',
                '60 min',
                '0,70 EUR',
                '06.10.2026 10:14',
                'Plaćeno',
                'Fiskalizirano',
            ],
            [
                '06.10.2026 09:11',
                'ZG5553AI',
                '2A',
                '120 min',
                '1,00 EUR',
                '06.10.2026 11:11',
                'Plaćeno',
                'U obradi',
            ],
        ])
        expect(within(table).getByRole('link', { name: 'ZG1234AB' })).toHaveAttribute(
            'href',
            `${paths.tickets}/${mockTicketIds.newest}`,
        )
        expect(screen.getByText(t.shown(1, 25, 300))).toBeInTheDocument()
        expect(screen.getByText(t.moreInDetail)).toBeInTheDocument()
    })

    it('shows one card per ticket on a phone, as a list', async () => {
        await renderRoute(paths.tickets)

        const list = await screen.findByRole('list', { name: t.listLabel })
        const cards = within(list).getAllByRole('listitem')
        expect(cards).toHaveLength(25)
        const first = within(cards[0] ?? list)
        expect(first.getByRole('link', { name: /ZG1234AB/ })).toHaveAttribute(
            'href',
            `${paths.tickets}/${mockTicketIds.newest}`,
        )
        expect(first.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Zona',
            'Vrijedi do',
            'Plaćanje',
            'Fiskalizacija',
        ])
        expect(first.getAllByRole('definition').map((value) => value.textContent)).toEqual([
            'ZONA1',
            '06.10.2026 10:14',
            'Plaćeno',
            'Fiskalizirano',
        ])
        expect(screen.getByText(t.shownShort(1, 25, 300))).toBeInTheDocument()
    })

    it('pages forward, which changes the request and the URL', async () => {
        const requests = listRequests()
        const { user, router } = await renderRoute(paths.tickets)
        await ticketsTable()

        await user.click(within(tablePages()).getByRole('button', { name: hr.pagination.next }))

        expect(await findTableRange(26, 50)).toBeInTheDocument()
        expect(router.state.location.search).toBe('?page=2')
        expect(requests.at(-1)?.get('page')).toBe('2')
        expect(
            within(tablePages()).getByRole('button', { name: hr.pagination.page(2) }),
        ).toHaveAttribute('aria-current', 'page')
        expect(firstPlate(await ticketsTable())).not.toBe('ZG1234AB')
    })

    it('jumps to the last page and back to the first, which leaves the URL clean', async () => {
        const { user, router } = await renderRoute(paths.tickets)
        await ticketsTable()

        await user.click(within(tablePages()).getByRole('button', { name: hr.pagination.page(12) }))
        expect(await findTableRange(276, 300)).toBeInTheDocument()
        expect(
            within(tablePages()).getByRole('button', { name: hr.pagination.next }),
        ).toBeDisabled()

        await user.click(within(tablePages()).getByRole('button', { name: hr.pagination.page(1) }))

        expect(await findTableRange(1, 25)).toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('opens on the page in the URL', async () => {
        await renderRoute(`${paths.tickets}?page=3`)
        await ticketsTable()

        expect(await findTableRange(51, 75)).toBeInTheDocument()
    })

    it('reads an invalid page in the URL as the first page', async () => {
        await renderRoute(`${paths.tickets}?page=abc`)
        await ticketsTable()

        expect(await findTableRange(1, 25)).toBeInTheDocument()
    })

    it('keeps the current rows until the next page arrives', async () => {
        const { user } = await renderRoute(paths.tickets)
        const table = await ticketsTable()
        server.use(
            http.get(apiUrl('/tickets'), async () => {
                await delay('infinite')

                return HttpResponse.json({})
            }),
        )

        await user.click(within(tablePages()).getByRole('button', { name: hr.pagination.next }))

        await waitFor(() => {
            expect(table).toHaveAttribute('aria-busy', 'true')
        })
        expect(bodyRows(table)).toHaveLength(25)
        expect(firstPlate(table)).toBe('ZG1234AB')
        expect(screen.queryByRole('status', { name: t.loading })).not.toBeInTheDocument()
    })

    it('sorts by plate on the server, from the first page, and keeps it in the URL', async () => {
        const requests = listRequests()
        const { user, router } = await renderRoute(`${paths.tickets}?page=2`)
        const table = await ticketsTable()
        const plateHeader = within(table).getByRole('columnheader', { name: t.columns.plate })
        expect(
            within(table).getByRole('columnheader', { name: t.columns.createdAt }),
        ).toHaveAttribute('aria-sort', 'descending')

        await user.click(within(plateHeader).getByRole('button', { name: t.columns.plate }))

        await waitFor(() => {
            expect(plateHeader).toHaveAttribute('aria-sort', 'ascending')
        })
        expect(router.state.location.search).toBe('?sort=plate&dir=asc')
        await waitFor(() => {
            expect(requests.at(-1)?.get('sortBy')).toBe('vehicleRegistration')
        })
        expect(requests.at(-1)?.get('sortDir')).toBe('asc')
        expect(requests.at(-1)?.get('page')).toBe('1')
    })

    it('shows the loading state while the first page loads', async () => {
        server.use(
            http.get(apiUrl('/tickets'), async () => {
                await delay('infinite')

                return HttpResponse.json({})
            }),
        )
        await renderRoute(paths.tickets)

        expect(await screen.findByRole('status')).toHaveTextContent(t.loading)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('shows the empty state when there are no tickets', async () => {
        server.use(
            http.get(apiUrl('/tickets'), () =>
                HttpResponse.json({ items: [], page: 1, pageSize: 25, totalCount: 0 }),
            ),
        )
        const { container } = await renderRoute(paths.tickets)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.empty.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.empty.description)).toBeInTheDocument()
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(screen.queryByRole('navigation', { name: hr.pagination.tableLabel })).toBeNull()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/tickets'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderRoute(paths.tickets)

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: t.errorTitle }),
        ).toBeInTheDocument()
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await ticketsTable()).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('has no axe violations with tickets loaded', async () => {
        const { container } = await renderRoute(paths.tickets)
        await ticketsTable()

        await expectNoAxeViolations(container)
    })
})
