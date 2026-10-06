import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminCredentials, mockAdminUser } from './adminUsers'
import { apiUrl } from './url'

const loginBodySchema = z.object({ username: z.string(), password: z.string() })

// Spec: login allows 5 requests per IP per minute in a fixed window, then answers 429.
const permitLimit = 5
const windowMs = 60_000
let windowStart = 0
let requestsInWindow = 0

export function resetLoginRateLimit(): void {
    windowStart = 0
    requestsInWindow = 0
}

function isRateLimited(now: number): boolean {
    if (now - windowStart >= windowMs) {
        windowStart = now
        requestsInWindow = 0
    }
    requestsInWindow += 1

    return requestsInWindow > permitLimit
}

export const authHandlers = [
    http.post(apiUrl('/login'), async ({ request }) => {
        if (isRateLimited(Date.now())) return new HttpResponse(null, { status: 429 })

        const body = loginBodySchema.safeParse(await request.json())
        if (!body.success) return new HttpResponse(null, { status: 400 })

        const { username, password } = body.data
        const isValid =
            username === mockAdminCredentials.username && password === mockAdminCredentials.password
        if (!isValid) return new HttpResponse(null, { status: 401 })

        return HttpResponse.json({ token: 'mock-jwt-admin', user: mockAdminUser })
    }),
]
