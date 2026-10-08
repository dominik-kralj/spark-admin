import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd())
    const useMockApi = env.VITE_API_MOCK === 'true'

    return {
        // Serves /mockServiceWorker.js (and emits it on build) only when the mock API is on.
        plugins: [react(), useMockApi && msw({ mode: 'worker-only' })],
        resolve: {
            alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        },
        test: {
            include: ['src/**/*.test.{ts,tsx}'],
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            css: false,
            // Chakra in jsdom is slow, and a form journey runs past 5 s when every file runs at once.
            testTimeout: 15_000,
            // Away from Zagreb and across midnight from it, so format tests catch local-time leaks.
            env: { TZ: 'America/Los_Angeles' },
        },
    }
})
