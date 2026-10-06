import { defineConfig } from '@playwright/test'

// Its own port, so a dev server already running (maybe on a real backend) is never reused.
const port = 5199

export default defineConfig({
    testDir: './e2e',
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        baseURL: `http://localhost:${port}`,
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'phone',
            use: {
                browserName: 'chromium',
                viewport: { width: 375, height: 812 },
                isMobile: true,
                hasTouch: true,
            },
        },
        {
            name: 'desktop',
            use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
        },
    ],
    webServer: {
        command: `pnpm dev --port ${port} --strictPort`,
        url: `http://localhost:${port}`,
        reuseExistingServer: false,
        env: { VITE_API_MOCK: 'true' },
    },
})
