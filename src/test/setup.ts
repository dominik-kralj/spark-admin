import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetLoginRateLimit } from '@/mocks/auth'
import { resetZones } from '@/mocks/zones'

import { server } from './server'
import { installMatchMedia, resetViewport } from './viewport'

beforeAll(() => {
    server.listen({ onUnhandledFrame: 'error' })
    // Absent in files that opt into the node environment.
    if (typeof window !== 'undefined') installMatchMedia()
})
afterEach(() => {
    cleanup()
    resetViewport()
    server.resetHandlers()
    resetLoginRateLimit()
    resetZones()
    // Absent in files that opt into the node environment.
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
})
afterAll(() => {
    server.close()
})
