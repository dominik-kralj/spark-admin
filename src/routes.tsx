import type { QueryClient, QueryExecuteOptions, QueryKey } from '@tanstack/react-query'
import type { ComponentType } from 'react'
import { redirect, type RouteObject } from 'react-router'

import { AppErrorPage, SectionErrorPage } from '@/ErrorPage'
import { adminUsersQuery } from '@/features/admin-users/api/useAdminUsers'
import { getSession } from '@/features/auth/api/useAuth'
import { ProtectedLayout } from '@/features/auth/components/ProtectedLayout'
import { redirectIfSignedIn, requireSession } from '@/features/auth/lib/sessionRedirects'
import { citySettingsQuery } from '@/features/city-settings/api/useCitySettings'
import { dailyTicketsQuery } from '@/features/daily-tickets/api/useDailyTickets'
import { readDailyTicketListParams } from '@/features/daily-tickets/lib/dailyTicketListParams'
import { inspectorsQuery } from '@/features/inspectors/api/useInspectors'
import { privilegedOwnersQuery } from '@/features/privileged-owners/api/usePrivilegedOwners'
import { reportsQuery } from '@/features/reports/api/useReports'
import { PlaceholderPage } from '@/features/shell/components/PlaceholderPage'
import { sections, type Section } from '@/features/shell/lib/sections'
import { newestTicketTimeQuery, ticketsQuery } from '@/features/tickets/api/useTickets'
import { readTicketListParams } from '@/features/tickets/lib/ticketListParams'
import { zonesQuery } from '@/features/zones/api/useZones'
import { paths } from '@/shared/paths'

const screens: Partial<Record<string, () => Promise<ComponentType>>> = {
    [paths.tickets]: async () =>
        (await import('@/features/tickets/components/TicketsPage')).TicketsPage,
    [paths.dailyTickets]: async () =>
        (await import('@/features/daily-tickets/components/DailyTicketsPage')).DailyTicketsPage,
    [paths.zones]: async () => (await import('@/features/zones/components/ZonesPage')).ZonesPage,
    [paths.privilegedOwners]: async () =>
        (await import('@/features/privileged-owners/components/PrivilegedOwnersPage'))
            .PrivilegedOwnersPage,
    [paths.inspectors]: async () =>
        (await import('@/features/inspectors/components/InspectorsPage')).InspectorsPage,
    [paths.reports]: async () =>
        (await import('@/features/reports/components/ReportsPage')).ReportsPage,
    [paths.citySettings]: async () =>
        (await import('@/features/city-settings/components/CitySettingsPage')).CitySettingsPage,
    [paths.adminUsers]: async () => (await import('@/AdminUsersRoute')).AdminUsersRoute,
}

type StartQueries = (queryClient: QueryClient, searchParams: URLSearchParams) => void

/**
 * Starts a query unless it is cached: a cached page shows at once and its own query refreshes it,
 * and a navigation inside the section (a detail, a filter) never refetches what is on screen.
 */
function startQuery<TData, TKey extends QueryKey>(
    queryClient: QueryClient,
    query: QueryExecuteOptions<TData, Error, TData, TData, TKey>,
): void {
    // The page shows how this request went: a failure is its error state with Retry, not a
    // second, silent attempt when the page mounts.
    queryClient.setQueryDefaults(query.queryKey, { retryOnMount: false })
    queryClient.query({ ...query, staleTime: Infinity }).catch(() => undefined)
}

// What each section's page asks for first, started by its loader alongside the page's download.
const pageQueries: Partial<Record<string, StartQueries>> = {
    [paths.tickets]: (queryClient, searchParams) => {
        const params = readTicketListParams(searchParams)
        startQuery(queryClient, ticketsQuery(params))
        // The rows and how new they are only move together.
        startQuery(queryClient, newestTicketTimeQuery(params.filters))
    },
    [paths.dailyTickets]: (queryClient, searchParams) => {
        startQuery(queryClient, dailyTicketsQuery(readDailyTicketListParams(searchParams)))
    },
    [paths.zones]: (queryClient) => {
        startQuery(queryClient, zonesQuery)
    },
    [paths.privilegedOwners]: (queryClient) => {
        startQuery(queryClient, privilegedOwnersQuery)
    },
    [paths.inspectors]: (queryClient) => {
        startQuery(queryClient, inspectorsQuery)
    },
    [paths.reports]: (queryClient) => {
        startQuery(queryClient, reportsQuery)
    },
    [paths.citySettings]: (queryClient) => {
        startQuery(queryClient, citySettingsQuery)
    },
    [paths.adminUsers]: (queryClient) => {
        startQuery(queryClient, adminUsersQuery)
    },
}

// A section whose detail opens over its list, so a detail link works on its own.
const detailParams: Partial<Record<string, string>> = {
    [paths.tickets]: 'ticketId',
    [paths.dailyTickets]: 'ticketId',
}

function sectionRoute({ path, labelKey }: Section, queryClient: QueryClient): RouteObject {
    const screen = screens[path]
    if (screen === undefined) {
        return {
            path,
            element: <PlaceholderPage labelKey={labelKey} />,
            ErrorBoundary: SectionErrorPage,
        }
    }

    const detailParam = detailParams[path]
    const startPageQueries = pageQueries[path]

    return {
        path: detailParam === undefined ? path : `${path}/:${detailParam}?`,
        // Not awaited, so the page shows its loading state; requireSession runs alongside it.
        loader: ({ request }) => {
            if (startPageQueries !== undefined && getSession() !== null) {
                startPageQueries(queryClient, new URL(request.url).searchParams)
            }

            return null
        },
        lazy: { Component: screen },
        ErrorBoundary: SectionErrorPage,
    }
}

// Fresh objects per router: React Router caches lazy results on the route objects.
export function createRoutes(queryClient: QueryClient): RouteObject[] {
    return [
        {
            // The first loader and lazy page are fast, so a blank screen beats a spinner flash.
            HydrateFallback: () => null,
            ErrorBoundary: AppErrorPage,
            children: [
                {
                    path: paths.login,
                    loader: redirectIfSignedIn,
                    lazy: {
                        Component: async () =>
                            (await import('@/features/auth/components/LoginPage')).LoginPage,
                    },
                },
                {
                    loader: requireSession,
                    Component: ProtectedLayout,
                    children: [
                        {
                            lazy: {
                                Component: async () => (await import('@/AppLayout')).AppLayout,
                            },
                            children: [
                                { index: true, loader: () => redirect(paths.home) },
                                ...sections.map((section) => sectionRoute(section, queryClient)),
                            ],
                        },
                        {
                            path: '*',
                            lazy: {
                                Component: async () =>
                                    (await import('@/NotFoundPage')).NotFoundPage,
                            },
                        },
                    ],
                },
            ],
        },
    ]
}
