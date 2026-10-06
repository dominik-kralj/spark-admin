import { QueryClient } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'

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
