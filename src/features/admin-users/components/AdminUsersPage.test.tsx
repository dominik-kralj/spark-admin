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

const t = hr.adminUsers

function rawAdminUser(username: string, adminUserId: number) {
    return { adminUserId, username, name: 'Ime', surname: 'Prezime' }
}

async function usersTable() {
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

function usernames(table: HTMLElement) {
    return bodyRows(table).map((row) => rowCells(row)[0])
}

describe('Admin user list', () => {
    beforeEach(() => {
        signInForTest()
    })

    it('has a titled page with the add action', async () => {
        await renderRoute(paths.adminUsers)

        expect(
            await screen.findByRole('heading', { level: 1, name: hr.nav.adminUsers }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.description)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: t.add })).toHaveLength(2)
        await waitFor(() => {
            expect(document.title).toBe('Korisnici – SPARK Admin')
        })
    })

    it('shows each user sorted by username, marks the signed-in one, and no password', async () => {
        await renderRoute(paths.adminUsers)

        const table = await usersTable()
        const headers = within(table).getAllByRole('columnheader')
        expect(headers.map((header) => header.textContent)).toEqual([
            t.columns.username,
            t.columns.fullName,
            t.actions,
        ])
        expect(bodyRows(table).map(rowCells)).toEqual([
            [`admin${t.you}`, 'Ana Kovač', ''],
            ['marin.loncar', 'Marin Lončar', ''],
            ['sanja.klaric', 'Sanja Klarić', ''],
        ])
        expect(
            within(table).getByRole('button', { name: t.editAdminUser('sanja.klaric') }),
        ).toBeInTheDocument()
        expect(screen.getByText('Ukupno 3 korisnika')).toBeInTheDocument()
        // The seed passwords; the mock never sends them, and nothing on the page may show one.
        expect(document.body).not.toHaveTextContent(/2026/)
    })

    it('shows one card per user on a phone, as a list', async () => {
        await renderRoute(paths.adminUsers)

        const list = await screen.findByRole('list', { name: t.listLabel })
        const cards = within(list).getAllByRole('listitem')
        expect(cards).toHaveLength(3)
        const first = within(cards[0] ?? list)
        expect(first.getByText('admin')).toBeInTheDocument()
        expect(first.getByText('Ana Kovač')).toBeInTheDocument()
        expect(first.getByText(t.you)).toBeInTheDocument()
        const last = within(cards[2] ?? list)
        expect(
            last.getByRole('button', { name: t.editAdminUser('sanja.klaric') }),
        ).toHaveTextContent(t.edit)
        expect(last.queryByText(t.you)).not.toBeInTheDocument()
    })

    it('reverses the order from the Korisničko ime header and keeps it in the URL', async () => {
        const { user, router } = await renderRoute(paths.adminUsers)
        const table = await usersTable()
        const usernameHeader = within(table).getByRole('columnheader', {
            name: t.columns.username,
        })
        expect(usernameHeader).toHaveAttribute('aria-sort', 'ascending')

        await user.click(within(usernameHeader).getByRole('button', { name: t.columns.username }))

        await waitFor(() => {
            expect(usernameHeader).toHaveAttribute('aria-sort', 'descending')
        })
        expect(usernames(table)).toEqual(['sanja.klaric', 'marin.loncar', `admin${t.you}`])
        expect(router.state.location.search).toBe('?sort=username&dir=desc')
    })

    it('sorts usernames in Croatian order, ignoring case', async () => {
        server.use(
            http.get(apiUrl('/users'), () =>
                HttpResponse.json([
                    rawAdminUser('zora', 2),
                    rawAdminUser('Čedo', 3),
                    rawAdminUser('cvita', 4),
                    rawAdminUser('Bruno', 5),
                ]),
            ),
        )
        await renderRoute(paths.adminUsers)

        expect(usernames(await usersTable())).toEqual(['Bruno', 'cvita', 'Čedo', 'zora'])
    })

    it('shows the loading state while the users load', async () => {
        server.use(
            http.get(apiUrl('/users'), async () => {
                await delay('infinite')

                return HttpResponse.json([])
            }),
        )
        await renderRoute(paths.adminUsers)

        expect(await screen.findByRole('status')).toHaveTextContent(t.loading)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('shows the empty state with the add action when there are no users', async () => {
        server.use(http.get(apiUrl('/users'), () => HttpResponse.json([])))
        const { container } = await renderRoute(paths.adminUsers)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.empty.title }),
        ).toBeInTheDocument()
        expect(screen.getByText(t.empty.description)).toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: t.add })).toHaveLength(3)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(apiUrl('/users'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderRoute(paths.adminUsers)

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: t.errorTitle }),
        ).toBeInTheDocument()
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await usersTable()).toBeInTheDocument()
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('has no axe violations with users loaded', async () => {
        const { container } = await renderRoute(paths.adminUsers)
        await usersTable()

        await expectNoAxeViolations(container)
    })
})
