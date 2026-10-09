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

const columnHeaders = ['Ime', 'Prezime', 'OIB', 'Status', 'Radnje']

function rawInspector(name: string, surname: string, inspectorId: number) {
    return {
        inspectorId,
        name,
        surname,
        oib: String(10_000_000_000 + inspectorId),
        isActive: true,
    }
}

async function inspectorsTable() {
    return screen.findByRole('table', { name: hr.inspectors.listLabel })
}

function bodyRows(table: HTMLElement) {
    return within(table).getAllByRole('row').slice(1)
}

function rowCells(row: HTMLElement) {
    return within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
}

function surnames(table: HTMLElement) {
    return bodyRows(table).map((row) => rowCells(row)[1])
}

describe('Inspector list', () => {
    beforeEach(() => {
        signInForTest()
    })

    it('has a titled page with the add action', async () => {
        await renderRoute(paths.inspectors)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.inspectors }),
        ).toBeInTheDocument()
        expect(screen.getByText(hr.inspectors.description)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: hr.inspectors.add })).toHaveLength(2)
        await waitFor(() => {
            expect(document.title).toBe('Kontrolori – SPARK Admin')
        })
    })

    it('shows each inspector with status as text, sorted by surname, and no PIN', async () => {
        await renderRoute(paths.inspectors)

        const table = await inspectorsTable()
        const headers = within(table).getAllByRole('columnheader')
        expect(headers.map((header) => header.textContent)).toEqual(columnHeaders)
        expect(bodyRows(table).map(rowCells)).toEqual([
            ['Marko', 'Horvat', '12345678901', 'Aktivan', ''],
            ['Petra', 'Novak', '23456789012', 'Aktivan', ''],
            ['Davor', 'Šimić', '34567890123', 'Neaktivan', ''],
        ])
        expect(
            within(table).getByRole('button', { name: 'Uredi kontrolora Davor Šimić' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Ukupno 3 kontrolora, 2 aktivna')).toBeInTheDocument()
        // The seed PINs; the mock never sends them, and nothing on the page may show one.
        expect(document.body).not.toHaveTextContent(/\b(1234|2580|1111)\b/)
    })

    it('shows one card per inspector on a phone, as a list', async () => {
        await renderRoute(paths.inspectors)

        const list = await screen.findByRole('list', { name: hr.inspectors.listLabel })
        const cards = within(list).getAllByRole('listitem')
        expect(cards).toHaveLength(3)
        const last = within(cards[2] ?? list)
        expect(last.getByText('Davor Šimić')).toBeInTheDocument()
        expect(
            last.getByRole('button', { name: 'Uredi kontrolora Davor Šimić' }),
        ).toHaveTextContent(hr.inspectors.edit)
        expect(last.getAllByRole('term').map((term) => term.textContent)).toEqual(['OIB', 'Status'])
        expect(last.getAllByRole('definition').map((value) => value.textContent)).toEqual([
            '34567890123',
            'Neaktivan',
        ])
    })

    it('sorts surnames in Croatian alphabetical order, then by first name', async () => {
        server.use(
            http.get(apiUrl('/inspectors'), () =>
                HttpResponse.json([
                    rawInspector('Ana', 'Šarić', 1),
                    rawInspector('Ivo', 'Čolić', 2),
                    rawInspector('Ana', 'Sabol', 3),
                    rawInspector('Ana', 'Cvitan', 4),
                    rawInspector('Zora', 'Babić', 5),
                    rawInspector('Ante', 'Babić', 6),
                ]),
            ),
        )
        await renderRoute(paths.inspectors)

        const table = await inspectorsTable()

        expect(surnames(table)).toEqual(['Babić', 'Babić', 'Cvitan', 'Čolić', 'Sabol', 'Šarić'])
        expect(rowCells(bodyRows(table)[0] ?? table)[0]).toBe('Ante')
    })

    it('reverses the order from the Prezime header and keeps it in the URL', async () => {
        const { user, router } = await renderRoute(paths.inspectors)
        const table = await inspectorsTable()
        const surnameHeader = within(table).getByRole('columnheader', {
            name: hr.inspectors.columns.surname,
        })
        expect(surnameHeader).toHaveAttribute('aria-sort', 'ascending')

        await user.click(
            within(surnameHeader).getByRole('button', { name: hr.inspectors.columns.surname }),
        )

        await waitFor(() => {
            expect(surnameHeader).toHaveAttribute('aria-sort', 'descending')
        })
        expect(surnames(table)).toEqual(['Šimić', 'Novak', 'Horvat'])
        expect(router.state.location.search).toBe('?sort=surname&dir=desc')
    })

    it('shows the loading state while the inspectors load', async () => {
        server.use(
            http.get(apiUrl('/inspectors'), async () => {
                await delay('infinite')

                return HttpResponse.json([])
            }),
        )
        await renderRoute(paths.inspectors)

        expect(await screen.findByRole('status')).toHaveTextContent(hr.inspectors.loading)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('shows the empty state with the add action when there are no inspectors', async () => {
        server.use(http.get(apiUrl('/inspectors'), () => HttpResponse.json([])))
        const { container } = await renderRoute(paths.inspectors)

        expect(
            await screen.findByRole('heading', { level: 2, name: hr.inspectors.empty.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(hr.inspectors.empty.description)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: hr.inspectors.add })).toHaveLength(3)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/inspectors'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderRoute(paths.inspectors)

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: hr.inspectors.errorTitle }),
        ).toBeInTheDocument()
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await inspectorsTable()).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('has no axe violations with inspectors loaded', async () => {
        const { container } = await renderRoute(paths.inspectors)
        await inspectorsTable()

        await expectNoAxeViolations(container)
    })
})
