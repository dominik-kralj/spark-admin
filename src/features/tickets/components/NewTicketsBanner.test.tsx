import { focusManager } from '@tanstack/react-query'
import { act, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { addMockTicket } from '@/mocks/tickets'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import { newTicketPollMs } from '../api/useTickets'

const t = hr.tickets
const n = t.newTickets

/** Records the query string of every new-count request. */
function countRequests(): URLSearchParams[] {
    const requests: URLSearchParams[] = []
    server.events.on('request:start', ({ request }) => {
        const url = new URL(request.url)
        if (url.pathname.endsWith('/tickets/new-count')) requests.push(url.searchParams)
    })

    return requests
}

function driversPay(count: number) {
    for (let index = 0; index < count; index += 1) {
        addMockTicket({ plate: `ST432${String(index)}KA`, zoneId: 1 })
    }
}

async function poll() {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(newTicketPollMs)
    })
}

function firstPlate(table: HTMLElement) {
    return within(within(table).getAllByRole('row')[1] ?? table).getAllByRole('cell')[1]
        ?.textContent
}

// A first render of 25 rows and 25 cards can pass the default 3 s while every file runs at once.
async function ticketsTable() {
    return screen.findByRole('table', { name: t.listLabel }, { timeout: 5000 })
}

describe('Karte new-tickets indicator', () => {
    beforeEach(() => {
        signInForTest()
        // Only the interval, which TanStack Query polls with; it follows real time, so waitFor still checks.
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'], shouldAdvanceTime: true })
    })

    afterEach(() => {
        vi.useRealTimers()
        focusManager.setFocused(undefined)
        server.events.removeAllListeners()
    })

    it('shows the count after a poll, and announces it, without moving the rows', async () => {
        const requests = countRequests()
        const { container } = await renderRoute(paths.tickets)
        const table = await ticketsTable()
        await waitFor(() => {
            expect(requests).toHaveLength(1)
        })
        expect(screen.queryByRole('button', { name: n.show })).not.toBeInTheDocument()

        driversPay(3)
        await poll()

        expect(await screen.findByRole('button', { name: n.show })).toBeInTheDocument()
        expect(screen.getByRole('status')).toHaveTextContent(n.count(3))
        expect(firstPlate(table)).toBe('ZG1234AB')
        await expectNoAxeViolations(container)
    })

    it('loads the new rows when asked, and counts from them again', async () => {
        const { user } = await renderRoute(paths.tickets)
        const table = await ticketsTable()
        driversPay(1)
        await poll()

        await user.click(await screen.findByRole('button', { name: n.show }))

        await waitFor(() => {
            expect(firstPlate(table)).toBe('ST4320KA')
        })
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: n.show })).not.toBeInTheDocument()
        })
        await poll()
        expect(screen.queryByRole('button', { name: n.show })).not.toBeInTheDocument()
    })

    it('counts with the filters, and shows new tickets from the first page in the default order', async () => {
        const requests = countRequests()
        const { user, router } = await renderRoute(
            `${paths.tickets}?page=2&sort=plate&dir=asc&zone=1`,
        )
        await ticketsTable()
        await waitFor(() => {
            expect(requests.at(-1)?.get('zoneId')).toBe('1')
        })
        driversPay(2)
        await poll()

        await user.click(await screen.findByRole('button', { name: n.show }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?zone=1')
        })
        await waitFor(() => {
            // The last of the two to arrive is the newest.
            expect(firstPlate(screen.getByRole('table', { name: t.listLabel }))).toBe('ST4321KA')
        })
    })

    it('does not poll while the tab is hidden', async () => {
        const requests = countRequests()
        await renderRoute(paths.tickets)
        await ticketsTable()
        await waitFor(() => {
            expect(requests).toHaveLength(1)
        })

        act(() => {
            focusManager.setFocused(false)
        })
        await poll()
        await poll()

        expect(requests).toHaveLength(1)
    })

    it('stops polling after sign-out', async () => {
        const requests = countRequests()
        const { user } = await renderRoute(paths.tickets)
        await ticketsTable()
        await waitFor(() => {
            expect(requests).toHaveLength(1)
        })

        await user.click(screen.getByRole('button', { name: hr.shell.signOut }))
        await screen.findByRole('button', { name: hr.login.submit })
        await poll()
        await poll()

        expect(requests).toHaveLength(1)
    })
})
