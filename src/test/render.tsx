import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { render, renderHook, waitFor, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement, ReactNode } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { expect } from 'vitest'

import { createRoutes } from '@/routes'
import { createQueryClient } from '@/shared/lib/queryClient'
import { AppProviders } from '@/shared/providers'

function createTestQueryClient(): QueryClient {
    return createQueryClient({ queries: { retry: false }, mutations: { retry: false } })
}

/** Renders inside the real providers, with a fresh non-retrying query client. */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
    const queryClient = createTestQueryClient()

    return {
        user: userEvent.setup(),
        queryClient,
        ...render(<AppProviders queryClient={queryClient}>{ui}</AppProviders>, options),
    }
}

/** Renders a hook with a fresh non-retrying query client and nothing else. */
export function renderHookWithQueryClient<TResult>(hook: () => TResult) {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    return { queryClient, ...renderHook(hook, { wrapper }) }
}

export type RenderedRoute = Awaited<ReturnType<typeof renderRoute>>

/** Resolves once the first route, its loader and its lazy module have rendered. */
export async function renderRoute(path: string) {
    const router = createMemoryRouter(createRoutes(), { initialEntries: [path] })
    const rendered = renderWithProviders(<RouterProvider router={router} />)

    // A cold lazy import can pass the default 1 s when the whole suite runs in parallel.
    await waitFor(
        () => {
            expect(router.state.initialized).toBe(true)
            expect(rendered.container).not.toBeEmptyDOMElement()
        },
        { timeout: 5000 },
    )

    return { router, ...rendered }
}
