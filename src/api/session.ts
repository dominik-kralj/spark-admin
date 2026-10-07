import { z } from 'zod'

const adminUserSchema = z.object({
    id: z.number(),
    tenantId: z.number(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
})

const storedSessionSchema = z.object({
    token: z.string().min(1),
    user: adminUserSchema,
})

export type AdminUser = z.infer<typeof adminUserSchema>

export interface Session {
    user: AdminUser
}

export type SessionEndReason = 'signedOut' | 'expired'

type SessionEndListener = (reason: SessionEndReason) => void

const storageKey = 'spark-admin.session'
const listeners = new Set<SessionEndListener>()

// See "Session" in AGENTS.md for why sessionStorage.
function readStoredSession(): z.infer<typeof storedSessionSchema> | null {
    const raw = sessionStorage.getItem(storageKey)
    if (raw === null) return null

    try {
        const parsed = storedSessionSchema.safeParse(JSON.parse(raw))

        return parsed.success ? parsed.data : null
    } catch {
        return null
    }
}

export function startSession(token: string, { user }: Session): void {
    sessionStorage.setItem(storageKey, JSON.stringify({ token, user }))
}

export function getSession(): Session | null {
    const stored = readStoredSession()

    return stored && { user: stored.user }
}

export function getAccessToken(): string | null {
    return readStoredSession()?.token ?? null
}

/** Ends the session once; later calls, such as parallel 401s, do nothing. */
export function endSession(reason: SessionEndReason): void {
    if (sessionStorage.getItem(storageKey) === null) return

    sessionStorage.removeItem(storageKey)
    for (const listener of listeners) listener(reason)
}

export function signOut(): void {
    endSession('signedOut')
}

export function onSessionEnd(listener: SessionEndListener): () => void {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}
