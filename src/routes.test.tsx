import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

// Each section's page module waits here, so a test can see what starts before it has loaded.
const pageModules = vi.hoisted(() => {
    let loaded = Promise.resolve()
    let release = () => undefined

    return {
        hold: () => {
            loaded = new Promise((resolve) => {
                release = () => {
                    resolve()
                }
            })
        },
        release: () => {
            release()
        },
        load: async (importOriginal: () => Promise<unknown>) => {
            await loaded

            return importOriginal()
        },
    }
})

vi.mock('@/features/tickets/components/TicketsPage', pageModules.load)
vi.mock('@/features/daily-tickets/components/DailyTicketsPage', pageModules.load)
vi.mock('@/features/zones/components/ZonesPage', pageModules.load)
vi.mock('@/features/privileged-owners/components/PrivilegedOwnersPage', pageModules.load)
vi.mock('@/features/inspectors/components/InspectorsPage', pageModules.load)
vi.mock('@/features/reports/components/ReportsPage', pageModules.load)
vi.mock('@/features/city-settings/components/CitySettingsPage', pageModules.load)
vi.mock('@/AdminUsersRoute', pageModules.load)

/** Records the path and query of every API request. */
function apiRequests(): URL[] {
    const requests: URL[] = []
    server.events.on('request:start', ({ request }) => {
        requests.push(new URL(request.url))
    })

    return requests
}

const sections = [
    { path: paths.tickets, title: hr.nav.tickets, endpoint: '/tickets' },
    { path: paths.dailyTickets, title: hr.nav.dailyTickets, endpoint: '/daily-tickets' },
    { path: paths.zones, title: hr.nav.zones, endpoint: '/zones' },
    {
        path: paths.privilegedOwners,
        title: hr.nav.privilegedOwners,
        endpoint: '/privileged-owners',
    },
    { path: paths.inspectors, title: hr.nav.inspectors, endpoint: '/inspectors' },
    { path: paths.reports, title: hr.nav.reports, endpoint: '/reports' },
    { path: paths.citySettings, title: hr.nav.citySettings, endpoint: '/tenant' },
    { path: paths.adminUsers, title: hr.nav.adminUsers, endpoint: '/users' },
]

describe('section routes', () => {
    beforeEach(() => {
        pageModules.hold()

        return () => {
            pageModules.release()
            server.events.removeAllListeners()
        }
    })

    it.each(sections)(
        'starts the $endpoint request before the page module has loaded',
        async ({ path, title, endpoint }) => {
            signInForTest()
            const requests = apiRequests()

            void renderRoute(path)

            await waitFor(() => {
                expect(requests.some((url) => url.pathname.endsWith(endpoint))).toBe(true)
            })
            expect(screen.queryByRole('heading', { level: 1, name: title })).toBeNull()

            pageModules.release()

            expect(
                await screen.findByRole('heading', { level: 1, name: title }, { timeout: 5000 }),
            ).toBeInTheDocument()
        },
    )

    it('asks for the zones once, so the page uses what the loader started', async () => {
        signInForTest()
        const requests = apiRequests()
        pageModules.release()

        await renderRoute(paths.zones)

        expect(await screen.findByRole('table', { name: hr.zones.listLabel })).toBeInTheDocument()
        expect(requests.filter((url) => url.pathname.endsWith('/zones'))).toHaveLength(1)
    })

    it('sends nothing for a section while signed out', async () => {
        const requests = apiRequests()
        pageModules.release()

        const { router } = await renderRoute(paths.zones)

        await waitFor(() => {
            expect(router.state.location.pathname).toBe(paths.login)
        })
        expect(requests.filter((url) => url.pathname.endsWith('/zones'))).toHaveLength(0)
    })
})
