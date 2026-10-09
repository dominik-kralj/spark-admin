import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

describe('Query cache', () => {
    it('shows a page visited within the minute from the cache, without asking again', async () => {
        signInForTest()
        let zoneRequests = 0
        server.events.on('request:start', ({ request }) => {
            if (new URL(request.url).pathname.endsWith('/zones')) zoneRequests += 1
        })
        const { router } = await renderRoute(paths.zones)
        expect(await screen.findByRole('table', { name: hr.zones.listLabel })).toBeInTheDocument()
        const firstVisit = zoneRequests

        await router.navigate(paths.inspectors)
        await screen.findByRole('heading', { level: 1, name: hr.nav.inspectors })
        await router.navigate(paths.zones)

        expect(await screen.findByRole('table', { name: hr.zones.listLabel })).toBeInTheDocument()
        expect(zoneRequests).toBe(firstVisit)
        server.events.removeAllListeners()
    })
})
