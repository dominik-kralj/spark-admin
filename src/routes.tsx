import type { ComponentType } from 'react'
import { redirect, type RouteObject } from 'react-router'

import { AppErrorPage, SectionErrorPage } from '@/ErrorPage'
import { ProtectedLayout } from '@/features/auth/components/ProtectedLayout'
import { redirectIfSignedIn, requireSession } from '@/features/auth/lib/sessionRedirects'
import { PlaceholderPage } from '@/features/shell/components/PlaceholderPage'
import { sections, type Section } from '@/features/shell/lib/sections'
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
    [paths.citySettings]: async () =>
        (await import('@/features/city-settings/components/CitySettingsPage')).CitySettingsPage,
    [paths.adminUsers]: async () => (await import('@/AdminUsersRoute')).AdminUsersRoute,
}

// A section whose detail opens over its list, so a detail link works on its own.
const detailParams: Partial<Record<string, string>> = {
    [paths.tickets]: 'ticketId',
    [paths.dailyTickets]: 'ticketId',
}

function sectionRoute({ path, labelKey }: Section): RouteObject {
    const screen = screens[path]
    if (screen === undefined) {
        return {
            path,
            element: <PlaceholderPage labelKey={labelKey} />,
            ErrorBoundary: SectionErrorPage,
        }
    }

    const detailParam = detailParams[path]

    return {
        path: detailParam === undefined ? path : `${path}/:${detailParam}?`,
        lazy: { Component: screen },
        ErrorBoundary: SectionErrorPage,
    }
}

// Fresh objects per router: React Router caches lazy results on the route objects.
export function createRoutes(): RouteObject[] {
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
                                ...sections.map(sectionRoute),
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
