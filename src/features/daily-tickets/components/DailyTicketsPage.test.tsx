import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { mockDailyTicketIds } from '@/mocks/dailyTickets'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.dailyTickets
const f = hr.ticketFilters
const seedCount = 60

const columnHeaders = [
    'Vrijeme',
    'Registracija',
    'Zona',
    'Adresa',
    'Kontrolor',
    'Iznos',
    'Fiskalizacija',
    'Radnja',
]

async function dailyTicketsTable() {
    return screen.findByRole('table', { name: t.listLabel }, { timeout: 5000 })
}

function bodyRows(table: HTMLElement) {
    return within(table).getAllByRole('row').slice(1)
}

function rowCells(row: HTMLElement) {
    return within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
}

function tablePages() {
    return screen.getByRole('navigation', { name: hr.pagination.tableLabel })
}

async function findTableRange(from: number, to: number, total = seedCount) {
    const footer = tablePages().parentElement ?? document.body

    return within(footer).findByText(hr.pagination.shown(from, to, total))
}

function filterBar() {
    return within(screen.getByRole('search', { name: t.filters.label }))
}

/** Records the query string of every list request. */
function listRequests(): URLSearchParams[] {
    const requests: URLSearchParams[] = []
    server.events.on('request:start', ({ request }) => {
        const url = new URL(request.url)
        if (url.pathname.endsWith('/daily-tickets')) requests.push(url.searchParams)
    })

    return requests
}

describe('DPK list', () => {
    beforeEach(() => {
        signInForTest()

        return () => {
            server.events.removeAllListeners()
        }
    })

    it('has a titled page with its description', async () => {
        await renderRoute(paths.dailyTickets)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.dailyTickets }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.description)).toBeInTheDocument()
        await waitFor(() => {
            expect(document.title).toBe('DPK – SPARK Admin')
        })
    })

    it('shows the newest daily tickets with formatted values and status as text', async () => {
        await renderRoute(paths.dailyTickets)

        const table = await dailyTicketsTable()
        expect(
            within(table)
                .getAllByRole('columnheader')
                .map((header) => header.textContent),
        ).toEqual(columnHeaders)
        expect(bodyRows(table)).toHaveLength(25)
        expect(bodyRows(table).slice(0, 2).map(rowCells)).toEqual([
            [
                '06.10.2026 09:05',
                'ZG5553AI',
                'ZONA1',
                'Trg kralja Tomislava 5',
                'Marko Horvat',
                '15,00 EUR',
                'Fiskalizirano',
                '',
            ],
            [
                '06.10.2026 08:48',
                'ZG9087KL',
                '2A',
                'Perkovčeva ulica 12',
                'Marko Horvat',
                '15,00 EUR',
                'Neuspjelo',
                t.fiscalize.action,
            ],
        ])
        expect(within(table).getByRole('link', { name: 'ZG5553AI' })).toHaveAttribute(
            'href',
            `${paths.dailyTickets}/${mockDailyTicketIds.newest}`,
        )
        expect(screen.getByText(hr.pagination.shown(1, 25, seedCount))).toBeInTheDocument()
        expect(screen.getByText(t.moreInDetail)).toBeInTheDocument()
    })

    it('shows one card per daily ticket on a phone, as a list', async () => {
        await renderRoute(paths.dailyTickets)

        const list = await screen.findByRole('list', { name: t.listLabel })
        const cards = within(list).getAllByRole('listitem')
        expect(cards).toHaveLength(25)
        const [first, second] = cards.map((card) => within(card))
        expect(first?.getByRole('link', { name: /ZG5553AI/ })).toHaveAttribute(
            'href',
            `${paths.dailyTickets}/${mockDailyTicketIds.newest}`,
        )
        expect(first?.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Zona',
            'Fiskalizacija',
            'Adresa',
        ])
        expect(first?.getAllByRole('definition').map((value) => value.textContent)).toEqual([
            'ZONA1',
            'Fiskalizirano',
            'Trg kralja Tomislava 5',
        ])
        expect(first?.queryByRole('button')).not.toBeInTheDocument()
        expect(
            second?.getByRole('button', { name: t.fiscalize.actionFor('ZG9087KL') }),
        ).toBeInTheDocument()
        expect(screen.getByText(hr.pagination.shownShort(1, 25, seedCount))).toBeInTheDocument()
    })

    it('pages forward, which changes the request and the URL', async () => {
        const requests = listRequests()
        const { user, router } = await renderRoute(paths.dailyTickets)
        await dailyTicketsTable()

        await user.click(within(tablePages()).getByRole('button', { name: hr.pagination.next }))

        expect(await findTableRange(26, 50)).toBeInTheDocument()
        expect(router.state.location.search).toBe('?page=2')
        expect(requests.at(-1)?.get('page')).toBe('2')
    })

    it('offers the first page when the page in the URL is past the end', async () => {
        const { user, router } = await renderRoute(`${paths.dailyTickets}?page=9`)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.pastEnd.title }),
        ).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: t.pastEnd.action }))
        await dailyTicketsTable()

        expect(await findTableRange(1, 25)).toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('sorts by inspector on the server, from the first page, and keeps it in the URL', async () => {
        const requests = listRequests()
        const { user, router } = await renderRoute(`${paths.dailyTickets}?page=2`)
        const table = await dailyTicketsTable()
        const header = within(table).getByRole('columnheader', { name: t.columns.inspector })

        await user.click(within(header).getByRole('button', { name: t.columns.inspector }))

        await waitFor(() => {
            expect(header).toHaveAttribute('aria-sort', 'ascending')
        })
        expect(router.state.location.search).toBe('?sort=inspector&dir=asc')
        await waitFor(() => {
            expect(requests.at(-1)?.get('sortBy')).toBe('inspector')
        })
        expect(requests.at(-1)?.get('page')).toBe('1')
    })

    it('filters by plate, date range, zone and fiscalization, with every value in the URL', async () => {
        const requests = listRequests()
        const { user, router } = await renderRoute(paths.dailyTickets)
        await dailyTicketsTable()

        await user.type(filterBar().getByRole('searchbox', { name: f.plate }), 'zg 90')
        await user.type(filterBar().getByRole('textbox', { name: f.from }), '05.10.2026')
        await user.type(filterBar().getByRole('textbox', { name: f.to }), '06.10.2026')
        await user.selectOptions(filterBar().getByRole('combobox', { name: f.zone }), '2A')
        await user.selectOptions(
            filterBar().getByRole('combobox', { name: f.fiscal }),
            hr.processingStatus.fiscal.failed,
        )
        await user.click(filterBar().getByRole('button', { name: f.search }))

        await waitFor(() => {
            expect(router.state.location.search).toBe(
                '?plate=ZG90&from=2026-10-05&to=2026-10-06&zone=2&fiscal=failed',
            )
        })
        await waitFor(() => {
            expect(requests.at(-1)?.get('fiscalStatus')).toBe('FAIL')
        })
        expect(Object.fromEntries(requests.at(-1) ?? [])).toMatchObject({
            plate: 'ZG90',
            createdFrom: '2026-10-04T22:00:00.000Z',
            createdTo: '2026-10-06T22:00:00.000Z',
            zoneId: '2',
        })
        const table = await dailyTicketsTable()
        await waitFor(() => {
            expect(bodyRows(table).map((row) => rowCells(row)[1])).toEqual(['ZG9087KL'])
        })
        expect(
            screen.getByRole('button', { name: f.remove(f.tags.zone('2A')) }),
        ).toBeInTheDocument()
    })

    it('says when no daily ticket matches the filters, and clears them', async () => {
        const { user, router } = await renderRoute(`${paths.dailyTickets}?plate=XX9999`)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.filters.noResults.title }),
        ).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: f.clearAll }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('')
        })
        expect(await dailyTicketsTable()).toBeInTheDocument()
    })

    it('shows the loading state while the first page loads', async () => {
        server.use(
            http.get(apiUrl('/daily-tickets'), async () => {
                await delay('infinite')

                return HttpResponse.json({})
            }),
        )
        await renderRoute(paths.dailyTickets)

        expect(await screen.findByRole('status')).toHaveTextContent(t.loading)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('shows the empty state when there are no daily tickets', async () => {
        server.use(
            http.get(apiUrl('/daily-tickets'), () =>
                HttpResponse.json({ items: [], page: 1, pageSize: 25, totalCount: 0 }),
            ),
        )
        const { container } = await renderRoute(paths.dailyTickets)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.empty.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.empty.description)).toBeInTheDocument()
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/daily-tickets'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderRoute(paths.dailyTickets)

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: t.errorTitle }),
        ).toBeInTheDocument()
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await dailyTicketsTable()).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('has no axe violations with daily tickets loaded', async () => {
        const { container } = await renderRoute(paths.dailyTickets)
        await dailyTicketsTable()

        await expectNoAxeViolations(container)
    })
})
