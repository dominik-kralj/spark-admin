import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { endSession, getSessionUser, request, startSession } from '@/shared/api'

import { loginResponseSchema, toSession, type Credentials } from '../validators/login'
import { parseSessionUser, type Session } from '../validators/session'

export interface SignInFailure {
    error: Error
    attempt: number
}

interface UseAuthOptions {
    onSignIn?: (session: Session) => void
}

/** For route loaders, which can't call hooks. */
export function getSession(): Session | null {
    return parseSessionUser(getSessionUser())
}

function signOut(): void {
    endSession('signedOut')
}

async function signIn(credentials: Credentials): Promise<Session> {
    const response = await request('/login', {
        method: 'POST',
        body: credentials,
        schema: loginResponseSchema,
    })
    const session = toSession(response)
    startSession(response.token, session.user)

    return session
}

export function useAuth({ onSignIn }: UseAuthOptions = {}) {
    // A ref, not mutation variables, so the password never enters the mutation cache.
    const credentialsRef = useRef<Credentials | null>(null)
    const [failure, setFailure] = useState<SignInFailure | null>(null)
    const mutation = useMutation({
        mutationFn: () => {
            if (credentialsRef.current === null) {
                throw new Error('signIn called without credentials')
            }

            return signIn(credentialsRef.current)
        },
        onSuccess: (session) => {
            setFailure(null)
            onSignIn?.(session)
        },
        onError: (error) => {
            setFailure((previous) => ({ error, attempt: (previous?.attempt ?? 0) + 1 }))
        },
        onSettled: () => {
            credentialsRef.current = null
        },
    })

    function signInOnce(credentials: Credentials): void {
        if (credentialsRef.current !== null) return

        credentialsRef.current = credentials
        mutation.mutate()
    }

    return { signIn: signInOnce, signOut, isPending: mutation.isPending, failure }
}
