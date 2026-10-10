import type { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { createRoutes } from '@/routes'

interface AppProps {
    /** The providers' client too, so a route's loader fills the cache the page reads. */
    queryClient: QueryClient
}

export function App({ queryClient }: AppProps) {
    const [router] = useState(() => createBrowserRouter(createRoutes(queryClient)))

    return <RouterProvider router={router} />
}
