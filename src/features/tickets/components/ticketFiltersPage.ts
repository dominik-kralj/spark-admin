import { screen, within } from '@testing-library/react'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'

const t = hr.tickets

/** Records the query string of every list request (not the newest-ticket lookup). */
export function listRequests(): URLSearchParams[] {
    const requests: URLSearchParams[] = []
    server.events.on('request:start', ({ request }) => {
        const url = new URL(request.url)
        if (url.pathname.endsWith('/tickets') && url.searchParams.get('pageSize') !== '1') {
            requests.push(url.searchParams)
        }
    })

    return requests
}

// A first render of 25 rows and 25 cards can pass the default 3 s while every file runs at once.
export async function ticketsTable() {
    return screen.findByRole('table', { name: t.listLabel }, { timeout: 5000 })
}

/** Queries inside the Karte filter bar. */
export function bar() {
    return within(screen.getByRole('search', { name: t.filters.label }))
}

export async function openPage(path: string = paths.tickets) {
    const rendered = await renderRoute(path)
    await ticketsTable()

    return rendered
}
