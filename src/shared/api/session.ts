import { z } from 'zod'

// The user's shape belongs to the auth feature, which validates it on read.
const storedSessionSchema = z.object({
    token: z.string().min(1),
    user: z.unknown(),
})

export type SessionEndReason = 'signedOut' | 'expired'

type SessionEndListener = (reason: SessionEndReason) => void

const storageKey = 'spark-admin.session'
const listeners = new Set<SessionEndListener>()

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

export function startSession(token: string, user: unknown): void {
    sessionStorage.setItem(storageKey, JSON.stringify({ token, user }))
}

export function getAccessToken(): string | null {
    return readStoredSession()?.token ?? null
}

export function getSessionUser(): unknown {
    return readStoredSession()?.user ?? null
}

/** Ends the session once; later calls, such as parallel 401s, do nothing. */
export function endSession(reason: SessionEndReason): void {
    if (sessionStorage.getItem(storageKey) === null) return

    sessionStorage.removeItem(storageKey)
    for (const listener of listeners) listener(reason)
}

export function onSessionEnd(listener: SessionEndListener): () => void {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}
