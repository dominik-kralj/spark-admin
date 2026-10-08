import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.privilegedOwners

const columnHeaders = ['Registracija', 'Vrijedi do', 'Status', 'Vlasnik', 'Adresa', 'Radnje']

// The seed's newest expired entry ends on 30.09.2026, its oldest valid one on 31.12.2026.
const now = new Date('2026-10-08T10:00:00Z')

function rawOwner(vehicleRegistration: string, validUntil: string) {
    return {
        privilegedOwnerId: vehicleRegistration.length + validUntil.length,
        vehicleRegistration,
        validUntil,
        ownerName: 'Ana Horvat',
        address: 'Gajeva ulica',
        houseNo: '1',
        zipCode: '10430',
        city: 'Samobor',
    }
}

function serveOwners(owners: ReturnType<typeof rawOwner>[]) {
    server.use(http.get(apiUrl('/privileged-owners'), () => HttpResponse.json(owners)))
}

async function ownersTable() {
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

function platesIn(table: HTMLElement) {
    return bodyRows(table).map((row) => rowCells(row)[0])
}

function tab(name: string) {
    return screen.getByRole('tab', { name })
}

describe('Privileged owner list', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'], now })
        signInForTest()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('has a titled page with its description and the add action', async () => {
        await renderRoute(paths.privilegedOwners)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.privilegedOwners }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.description)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: t.add })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: t.addLong })).toBeInTheDocument()
        await waitFor(() => {
            expect(document.title).toBe('Povlašteni korisnici – SPARK Admin')
        })
    })

    it('shows every column, formatted, latest expiry first', async () => {
        await renderRoute(paths.privilegedOwners)

        const table = await ownersTable()
        const headers = within(table).getAllByRole('columnheader')
        expect(headers.map((header) => header.textContent)).toEqual(columnHeaders)
        expect(bodyRows(table).map(rowCells)).toEqual([
            [
                'ZG5553AI',
                '30.06.2027',
                'Važeće',
                'Marija Jurić',
                'Livadićeva ulica 3, 10430 Samobor',
                '',
            ],
            [
                'ZG3358EH',
                '31.03.2027',
                'Važeće',
                'Petar Božić',
                'Trg kralja Tomislava 11, 10430 Samobor',
                '',
            ],
            [
                'ZG1234AB',
                '31.12.2026',
                'Važeće',
                'Josip Babić',
                'Perkovčeva ulica 12, 10430 Samobor',
                '',
            ],
            [
                'ZG2271MN',
                '31.12.2026',
                'Važeće',
                'Katarina Vuković',
                'Ulica Ljudevita Gaja 8, 10430 Samobor',
                '',
            ],
            [
                'ZG9087KL',
                '30.09.2026',
                'Isteklo',
                'Tomislav Knežević',
                'Starogradska ulica 21, 10430 Samobor',
                '',
            ],
            [
                'ZG6140TR',
                '31.08.2026',
                'Isteklo',
                'Luka Pavlović',
                'Ulica Milana Langa 14, 10430 Samobor',
                '',
            ],
        ])
        expect(screen.getByText('Prikazano 6 od 6')).toBeInTheDocument()
        expect(
            within(table).getByRole('button', { name: t.editOwner('ZG9087KL') }),
        ).toBeInTheDocument()
    })

    it('counts an entry as valid through the last millisecond of its day, then expired', async () => {
        vi.setSystemTime(new Date('2026-10-08T21:59:59.999Z'))
        serveOwners([
            rawOwner('ZG1AA', '2026-10-08T21:59:59.999Z'),
            rawOwner('ZG2BB', '2026-10-08T21:59:59.998Z'),
        ])
        await renderRoute(paths.privilegedOwners)

        const table = await ownersTable()

        expect(bodyRows(table).map((row) => rowCells(row).slice(0, 3))).toEqual([
            ['ZG1AA', '08.10.2026', 'Važeće'],
            ['ZG2BB', '08.10.2026', 'Isteklo'],
        ])
    })

    it('shows one card per entry on a phone, with the expired marker as text', async () => {
        await renderRoute(paths.privilegedOwners)

        const list = await screen.findByRole('list', { name: t.listLabel })
        const cards = within(list).getAllByRole('listitem')
        expect(cards).toHaveLength(6)
        const expired = within(cards[4] ?? list)
        expect(expired.getByText('ZG9087KL')).toBeInTheDocument()
        expect(expired.getAllByRole('term').map((term) => term.textContent)).toEqual([
            'Vrijedi do',
            'Status',
            'Vlasnik',
        ])
        expect(expired.getAllByRole('definition').map((value) => value.textContent)).toEqual([
            '30.09.2026',
            'Isteklo',
            'Tomislav Knežević',
        ])
        expect(expired.getByRole('button', { name: t.editOwner('ZG9087KL') })).toBeInTheDocument()
    })

    it('filters by validity with the tabs, with counts, and keeps the tab in the URL', async () => {
        const { user, router } = await renderRoute(paths.privilegedOwners)
        await ownersTable()
        expect(tab('Svi (6)')).toHaveAttribute('aria-selected', 'true')
        expect(tab('Važeći (4)')).toBeInTheDocument()

        await user.click(tab('Istekli (2)'))

        await waitFor(() => {
            expect(tab('Istekli (2)')).toHaveAttribute('aria-selected', 'true')
        })
        expect(platesIn(await ownersTable())).toEqual(['ZG9087KL', 'ZG6140TR'])
        expect(screen.getByText('Prikazano 2 od 6')).toBeInTheDocument()
        expect(router.state.location.search).toBe('?validity=expired')

        await user.click(tab('Važeći (4)'))

        await waitFor(() => {
            expect(platesIn(screen.getByRole('table', { name: t.listLabel }))).toEqual([
                'ZG5553AI',
                'ZG3358EH',
                'ZG1234AB',
                'ZG2271MN',
            ])
        })

        await user.click(tab('Svi (6)'))

        await waitFor(() => {
            expect(router.state.location.search).toBe('')
        })
    })

    // Selecting on arrow keys needs real frames; e2e/privileged-owners.spec.ts checks it.
    it('makes the tabs one tab stop that the arrow keys move through', async () => {
        const { user } = await renderRoute(paths.privilegedOwners)
        await ownersTable()
        expect(screen.getAllByRole('tab').map((element) => element.tabIndex)).toEqual([0, -1, -1])

        await user.click(tab('Svi (6)'))
        await user.keyboard('{ArrowRight}')

        await waitFor(() => {
            expect(tab('Važeći (4)')).toHaveFocus()
        })
    })

    it('opens with the tab from the URL', async () => {
        await renderRoute(`${paths.privilegedOwners}?validity=valid`)

        const table = await ownersTable()

        expect(platesIn(table)).toHaveLength(4)
        expect(tab('Važeći (4)')).toHaveAttribute('aria-selected', 'true')
    })

    it('sorts by plate from its header and keeps the order in the URL', async () => {
        const { user, router } = await renderRoute(paths.privilegedOwners)
        const table = await ownersTable()
        const plateHeader = within(table).getByRole('columnheader', { name: t.columns.plate })
        const dateHeader = within(table).getByRole('columnheader', { name: t.columns.validUntil })
        expect(dateHeader).toHaveAttribute('aria-sort', 'descending')
        expect(plateHeader).not.toHaveAttribute('aria-sort')

        await user.click(within(plateHeader).getByRole('button'))

        await waitFor(() => {
            expect(plateHeader).toHaveAttribute('aria-sort', 'ascending')
        })
        expect(dateHeader).not.toHaveAttribute('aria-sort')
        expect(platesIn(table)).toEqual([
            'ZG1234AB',
            'ZG2271MN',
            'ZG3358EH',
            'ZG5553AI',
            'ZG6140TR',
            'ZG9087KL',
        ])
        expect(router.state.location.search).toBe('?sort=plate&dir=asc')
    })

    it('searches by plate in any spelling, recounts the tabs, and normalises on leaving', async () => {
        const { user, router } = await renderRoute(paths.privilegedOwners)
        const table = await ownersTable()
        const search = screen.getByRole('searchbox', { name: t.search.label })

        await user.type(search, 'zg 9')

        await waitFor(() => {
            expect(platesIn(table)).toEqual(['ZG9087KL'])
        })
        expect(tab('Svi (1)')).toBeInTheDocument()
        expect(tab('Važeći (0)')).toBeInTheDocument()
        expect(screen.getByText('Prikazano 1 od 6')).toBeInTheDocument()
        expect(search).toHaveValue('zg 9')

        await user.tab()

        await waitFor(() => {
            expect(search).toHaveValue('ZG9')
        })
        expect(router.state.location.search).toBe('?plate=ZG9')
    })

    it('says when no plate matches, and clears the search', async () => {
        const { user } = await renderRoute(`${paths.privilegedOwners}?plate=XX`)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.noMatch.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.noMatch.description)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: t.noMatch.clear }))

        expect(await ownersTable()).toBeInTheDocument()
        expect(screen.getByRole('searchbox', { name: t.search.label })).toHaveValue('')
        expect(screen.getByRole('searchbox', { name: t.search.label })).toHaveFocus()
    })

    it('says when a tab has no entries', async () => {
        serveOwners([rawOwner('ZG1AA', '2027-01-31T22:59:59.999Z')])
        await renderRoute(`${paths.privilegedOwners}?validity=expired`)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.emptyTab.expired.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.emptyTab.expired.description)).toBeInTheDocument()
    })

    it('shows the loading state while the entries load', async () => {
        server.use(
            http.get(apiUrl('/privileged-owners'), async () => {
                await delay('infinite')

                return HttpResponse.json([])
            }),
        )
        await renderRoute(paths.privilegedOwners)

        expect(await screen.findByRole('status')).toHaveTextContent(t.loading)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        expect(tab(t.validity.all)).toBeInTheDocument()
    })

    it('shows the empty state with the add action when there are no entries', async () => {
        serveOwners([])
        const { container } = await renderRoute(paths.privilegedOwners)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.empty.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.empty.description)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: t.add })).toHaveLength(2)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/privileged-owners'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderRoute(paths.privilegedOwners)

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: t.errorTitle }),
        ).toBeInTheDocument()
        expect(within(alert).getByText(hr.listStates.errors.server)).toBeInTheDocument()
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await ownersTable()).toBeInTheDocument()
    })

    it('has no axe violations with entries loaded', async () => {
        const { container } = await renderRoute(paths.privilegedOwners)
        await ownersTable()

        await expectNoAxeViolations(container)
    })
})
