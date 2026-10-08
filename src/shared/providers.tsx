import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'

import { useLanguage } from '@/shared/i18n/useStrings'
import { system } from '@/shared/theme/system'

interface AppProvidersProps {
    children: ReactNode
    queryClient?: QueryClient
}

export function AppProviders({ children, queryClient }: AppProvidersProps) {
    const [client] = useState(() => queryClient ?? new QueryClient())
    const language = useLanguage()

    useEffect(() => {
        document.documentElement.lang = language
    }, [language])

    return (
        <ChakraProvider value={system}>
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </ChakraProvider>
    )
}
