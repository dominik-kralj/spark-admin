import { redirect, type RouteObject } from 'react-router'

import { ProtectedLayout } from '@/features/auth/components/ProtectedLayout'
import { redirectIfSignedIn, requireSession } from '@/features/auth/lib/sessionRedirects'
import { PlaceholderPage } from '@/features/shell/components/PlaceholderPage'
import { sections } from '@/features/shell/lib/sections'
import { paths } from '@/shared/paths'

// Sections with a real screen; the rest show a placeholder until they are built.
const builtSections = new Set<string>([paths.zones])

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
                                {
                                    path: paths.zones,
                                    lazy: {
                                        Component: async () =>
                                            (await import('@/features/zones/components/ZonesPage'))
                                                .ZonesPage,
                                    },
                                },
                                ...sections
                                    .filter(({ path }) => !builtSections.has(path))
                                    .map(({ path, label }) => ({
                                        path,
                                        element: <PlaceholderPage title={label} />,
                                    })),
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
