import type { RouteObject } from 'react-router'

import { ProtectedLayout } from '@/features/auth/ProtectedLayout'
import { redirectIfSignedIn, requireSession } from '@/features/auth/sessionRedirects'
import { paths } from '@/shared/paths'

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
                            (await import('@/features/auth/LoginPage')).LoginPage,
                    },
                },
                {
                    loader: requireSession,
                    Component: ProtectedLayout,
                    children: [
                        {
                            index: true,
                            lazy: { Component: async () => (await import('@/HomePage')).HomePage },
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
