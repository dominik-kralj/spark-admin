import { z } from 'zod'

import type { AdminUser } from '@/features/auth/validators/session'
import { request, startSession } from '@/shared/api'

export const testUser: AdminUser = {
    id: 1,
    tenantId: 1,
    username: 'ana',
    firstName: 'Ana',
    lastName: 'Kovač',
}

/** Starts a session as if the user had signed in, or reloaded a signed-in tab. */
export function signInForTest(): void {
    startSession('test-jwt', testUser)
}

/** Sends a signed-in request the way any screen would, ignoring its outcome. */
export async function sendSignedInRequest(path: string): Promise<void> {
    await request(path, { schema: z.unknown() }).catch(() => undefined)
}
