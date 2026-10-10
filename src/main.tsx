import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'
import { config } from '@/shared/config'
import { getLanguage } from '@/shared/i18n/language'
import { createQueryClient } from '@/shared/lib/queryClient'
import { AppProviders } from '@/shared/providers'

async function enableMockApi() {
    if (!config.useMockApi) return

    const { worker } = await import('@/mocks/browser')

    await worker.start({ onUnhandledFrame: 'bypass' })
}

// Before the first paint, so a reload in English never shows lang="hr" from index.html.
document.documentElement.lang = getLanguage()

const root = document.getElementById('root')

if (!root) throw new Error('Missing #root element')

const queryClient = createQueryClient()

void enableMockApi().then(() => {
    createRoot(root).render(
        <StrictMode>
            <AppProviders queryClient={queryClient}>
                <App queryClient={queryClient} />
            </AppProviders>
        </StrictMode>,
    )
})
