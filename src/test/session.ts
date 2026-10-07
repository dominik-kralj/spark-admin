import { z } from 'zod'

import { request } from '@/api/client'
import { startSession } from '@/api/session'

export const testUser = {
    id: 1,
    tenantId: 1,
    username: 'ana',
    firstName: 'Ana',
    lastName: 'Kovač',
}

/** Starts a session as if the user had signed in, or reloaded a signed-in tab. */
export function signInForTest(): void {
    startSession('test-jwt', { user: testUser })
}

/** Sends a signed-in request the way any screen would, ignoring its outcome. */
export async function sendSignedInRequest(path: string): Promise<void> {
    await request(path, { schema: z.unknown() }).catch(() => undefined)
}
