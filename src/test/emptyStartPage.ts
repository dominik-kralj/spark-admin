import { http, HttpResponse } from 'msw'

import { apiUrl } from '@/mocks/url'

import { server } from './server'

/**
 * Karte, the start page, with no tickets: shell tests need a page inside the shell, and
 * a full page of rows makes every Tab and role query walk a few hundred extra nodes.
 */
export function stubEmptyStartPage(): void {
    server.use(
        http.get(apiUrl('/tickets'), () =>
            HttpResponse.json({ items: [], page: 1, pageSize: 25, totalCount: 0 }),
        ),
    )
}
