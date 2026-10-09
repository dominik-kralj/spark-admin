import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetLoginRateLimit } from '@/mocks/auth'
import { resetInspectors } from '@/mocks/inspectors'
import { resetPrivilegedOwners } from '@/mocks/privilegedOwners'
import { resetTickets } from '@/mocks/tickets'
import { resetZones } from '@/mocks/zones'

import { server } from './server'
import { installMatchMedia, resetViewport } from './viewport'

// findBy and waitFor give up after 1 s by default, which a busy parallel run can pass.
configure({ asyncUtilTimeout: 3000 })

beforeAll(() => {
    server.listen({ onUnhandledFrame: 'error' })
    // Absent in files that opt into the node environment.
    if (typeof window !== 'undefined') {
        installMatchMedia()
        // jsdom has no layout; Chakra's menu positioning only needs the API to exist.
        globalThis.ResizeObserver = class {
            observe(): void {
                return undefined
            }
            unobserve(): void {
                return undefined
            }
            disconnect(): void {
                return undefined
            }
        }
    }
})
afterEach(() => {
    cleanup()
    resetViewport()
    server.resetHandlers()
    resetLoginRateLimit()
    resetZones()
    resetPrivilegedOwners()
    resetInspectors()
    resetTickets()
    // Absent in files that opt into the node environment.
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
    // The language choice lives here; every test starts in Croatian.
    if (typeof localStorage !== 'undefined') localStorage.clear()
})
afterAll(() => {
    server.close()
})
