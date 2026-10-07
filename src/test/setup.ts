import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetLoginRateLimit } from '@/mocks/auth'

import { server } from './server'

beforeAll(() => {
    server.listen({ onUnhandledFrame: 'error' })
})
afterEach(() => {
    cleanup()
    server.resetHandlers()
    resetLoginRateLimit()
    // Absent in files that opt into the node environment.
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
})
afterAll(() => {
    server.close()
})
