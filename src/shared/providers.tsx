import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'

import { useLanguage } from '@/shared/i18n/useStrings'
import { createQueryClient } from '@/shared/lib/queryClient'
import { system } from '@/shared/theme/system'
import { Toaster } from '@/shared/ui/Toaster'

interface AppProvidersProps {
    children: ReactNode
    queryClient?: QueryClient
}

export function AppProviders({ children, queryClient }: AppProvidersProps) {
    const [client] = useState(() => queryClient ?? createQueryClient())
    const language = useLanguage()

    useEffect(() => {
        document.documentElement.lang = language
    }, [language])

    return (
        <ChakraProvider value={system}>
            <QueryClientProvider client={client}>{children}</QueryClientProvider>
            <Toaster />
        </ChakraProvider>
    )
}
