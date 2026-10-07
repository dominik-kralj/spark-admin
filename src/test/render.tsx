import { QueryClient } from '@tanstack/react-query'
import { render, waitFor, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { expect } from 'vitest'

import { createRoutes } from '@/routes'
import { AppProviders } from '@/shared/providers'

/** Renders inside the real providers, with a fresh non-retrying query client. */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return {
        user: userEvent.setup(),
        queryClient,
        ...render(<AppProviders queryClient={queryClient}>{ui}</AppProviders>, options),
    }
}

export type RenderedRoute = Awaited<ReturnType<typeof renderRoute>>

/** Resolves once the first route, its loader and its lazy module have rendered. */
export async function renderRoute(path: string) {
    const router = createMemoryRouter(createRoutes(), { initialEntries: [path] })
    const rendered = renderWithProviders(<RouterProvider router={router} />)

    await waitFor(() => {
        expect(router.state.initialized).toBe(true)
        expect(rendered.container).not.toBeEmptyDOMElement()
    })

    return { router, ...rendered }
}
