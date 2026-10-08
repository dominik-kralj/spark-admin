import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const columnHeaders = [
    'Šifra',
    'Naziv',
    'Cijena',
    'Dnevna karta',
    'Trajanje',
    'Najviše produljenja',
    'Čekanje za DPK',
]

function rawZone(zoneCode: string, zoneId: number) {
    return {
        zoneId,
        zoneCode,
        zoneName: `Zona ${zoneCode}`,
        price: 1,
        dailyTicketPrice: 10,
        durationMinutes: 60,
        maxExtensions: 3,
        dpkIssueDelayMinutes: 15,
    }
}

async function zonesTable() {
    return screen.findByRole('table', { name: hr.zones.listLabel })
}

function bodyRows(table: HTMLElement) {
    return within(table).getAllByRole('row').slice(1)
}

function rowCells(row: HTMLElement) {
    return within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
}

describe('Zone list', () => {
    beforeEach(() => {
        signInForTest()
    })

    it('has a titled page with the add action', async () => {
        await renderRoute(paths.zones)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.zones }),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: hr.zones.add })).toBeInTheDocument()
        await waitFor(() => {
            expect(document.title).toBe('Zone – SPARK Admin')
        })
    })

    it('shows every zone column, formatted, sorted by code', async () => {
        await renderRoute(paths.zones)

        const table = await zonesTable()
        const headers = within(table).getAllByRole('columnheader')
        expect(headers.map((header) => header.textContent)).toEqual(columnHeaders)
        expect(bodyRows(table).map(rowCells)).toEqual([
            ['2A', 'Druga zona A', '0,50 EUR', '15,00 EUR', '60 min', '3', '20 min'],
            ['ZONA1', 'Prva zona', '0,70 EUR', '15,00 EUR', '60 min', '2', '15 min'],
        ])
        expect(screen.getByText('Ukupno 2 zone')).toBeInTheDocument()
    })

    it('shows one card per zone on a phone, as a list', async () => {
        await renderRoute(paths.zones)

        const list = await screen.findByRole('list', { name: hr.zones.listLabel })
        const cards = within(list).getAllByRole('listitem')
        expect(cards).toHaveLength(2)
        const first = within(cards[0] ?? list)
        expect(first.getByText('2A')).toBeInTheDocument()
        expect(first.getByText('Druga zona A')).toBeInTheDocument()
        expect(first.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Cijena',
            'Dnevna karta',
            'Trajanje',
        ])
        expect(first.getAllByRole('definition').map((value) => value.textContent)).toEqual([
            '0,50 EUR',
            '15,00 EUR',
            '60 min',
        ])
    })

    it('sorts codes by their numbers, not character by character', async () => {
        server.use(
            http.get(apiUrl('/zones'), () =>
                HttpResponse.json([rawZone('ZONA10', 1), rawZone('ZONA2', 2), rawZone('zona3', 3)]),
            ),
        )
        await renderRoute(paths.zones)

        const table = await zonesTable()

        expect(bodyRows(table).map((row) => rowCells(row)[0])).toEqual(['ZONA2', 'zona3', 'ZONA10'])
    })

    it('reverses the order from the Šifra header and keeps it in the URL', async () => {
        const { user, router } = await renderRoute(paths.zones)
        const table = await zonesTable()
        const codeHeader = within(table).getByRole('columnheader', { name: hr.zones.columns.code })
        expect(codeHeader).toHaveAttribute('aria-sort', 'ascending')

        await user.click(within(codeHeader).getByRole('button', { name: hr.zones.columns.code }))

        // Sorting is a URL change, and the router applies it after the click resolves.
        await waitFor(() => {
            expect(codeHeader).toHaveAttribute('aria-sort', 'descending')
        })
        expect(bodyRows(table).map((row) => rowCells(row)[0])).toEqual(['ZONA1', '2A'])
        expect(router.state.location.search).toBe('?sort=code&dir=desc')

        await user.click(within(codeHeader).getByRole('button', { name: hr.zones.columns.code }))

        await waitFor(() => {
            expect(codeHeader).toHaveAttribute('aria-sort', 'ascending')
        })
        expect(router.state.location.search).toBe('')
    })

    it('opens with the order from the URL', async () => {
        await renderRoute(`${paths.zones}?sort=code&dir=desc`)

        const table = await zonesTable()

        expect(bodyRows(table).map((row) => rowCells(row)[0])).toEqual(['ZONA1', '2A'])
    })

    it('ignores an order the list does not know', async () => {
        await renderRoute(`${paths.zones}?sort=price&dir=sideways`)

        const table = await zonesTable()

        expect(bodyRows(table).map((row) => rowCells(row)[0])).toEqual(['2A', 'ZONA1'])
    })

    it('shows the loading state while the zones load', async () => {
        server.use(
            http.get(apiUrl('/zones'), async () => {
                await delay('infinite')

                return HttpResponse.json([])
            }),
        )
        await renderRoute(paths.zones)

        expect(await screen.findByRole('status')).toHaveTextContent(hr.zones.loading)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 1, name: hr.nav.zones })).toBeInTheDocument()
    })

    it('shows the empty state with the add action when there are no zones', async () => {
        server.use(http.get(apiUrl('/zones'), () => HttpResponse.json([])))
        const { container } = await renderRoute(paths.zones)

        expect(
            await screen.findByRole('heading', { level: 2, name: hr.zones.empty.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(hr.zones.empty.description)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: hr.zones.add })).toHaveLength(2)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/zones'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderRoute(paths.zones)

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: hr.zones.errorTitle }),
        ).toBeInTheDocument()
        expect(within(alert).getByText(hr.listStates.errors.server)).toBeInTheDocument()
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await zonesTable()).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('has no axe violations with zones loaded', async () => {
        const { container } = await renderRoute(paths.zones)
        await zonesTable()

        await expectNoAxeViolations(container)
    })
})
