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
            // One worker per core starves each jsdom + Chakra file of CPU: half the cores ran
            // the suite faster (75 s against 112 s on 20 cores) and without timeouts.
            maxWorkers: '50%',
            // Chakra in jsdom is slow: the longest form journey takes about 10 s.
            testTimeout: 15_000,
            // Away from Zagreb and across midnight from it, so format tests catch local-time leaks.
            env: { TZ: 'America/Los_Angeles' },
        },
    }
})
