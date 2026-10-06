import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { system } from '@/shared/theme/system'

interface AppProvidersProps {
    children: ReactNode
    queryClient?: QueryClient
}

export function AppProviders({ children, queryClient }: AppProvidersProps) {
    const [client] = useState(() => queryClient ?? new QueryClient())

    return (
        <ChakraProvider value={system}>
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </ChakraProvider>
    )
}
