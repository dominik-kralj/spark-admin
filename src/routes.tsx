import type { ComponentType } from 'react'
import { redirect, type RouteObject } from 'react-router'

import { ProtectedLayout } from '@/features/auth/components/ProtectedLayout'
import { redirectIfSignedIn, requireSession } from '@/features/auth/lib/sessionRedirects'
import { PlaceholderPage } from '@/features/shell/components/PlaceholderPage'
import { sections, type Section } from '@/features/shell/lib/sections'
import { paths } from '@/shared/paths'

const screens: Partial<Record<string, () => Promise<ComponentType>>> = {
    [paths.zones]: async () => (await import('@/features/zones/components/ZonesPage')).ZonesPage,
    [paths.privilegedOwners]: async () =>
        (await import('@/features/privileged-owners/components/PrivilegedOwnersPage'))
            .PrivilegedOwnersPage,
}

function sectionRoute({ path, labelKey }: Section): RouteObject {
    const screen = screens[path]
    if (screen === undefined) return { path, element: <PlaceholderPage labelKey={labelKey} /> }

    return { path, lazy: { Component: screen } }
}

// Fresh objects per router: React Router caches lazy results on the route objects.
export function createRoutes(): RouteObject[] {
    return [
        {
            // The first loader and lazy page are fast, so a blank screen beats a spinner flash.
            HydrateFallback: () => null,
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
