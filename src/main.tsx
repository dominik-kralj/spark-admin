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
import { AppProviders } from '@/shared/providers'

async function enableMockApi() {
    if (!config.useMockApi) return

    const { worker } = await import('@/mocks/browser')

    await worker.start({ onUnhandledFrame: 'bypass' })
}

const root = document.getElementById('root')

if (!root) throw new Error('Missing #root element')

void enableMockApi().then(() => {
    createRoot(root).render(
        <StrictMode>
            <AppProviders>
                <App />
            </AppProviders>
        </StrictMode>,
    )
})
