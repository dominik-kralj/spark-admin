import { useMutation } from '@tanstack/react-query'
import { useRef } from 'react'
import { z } from 'zod'

import { request } from './client'
import { setAccessToken } from './session'

export interface Credentials {
    username: string
    password: string
}

export interface AdminUser {
    id: number
    tenantId: number
    username: string
    firstName: string
    lastName: string
}

export interface Session {
    user: AdminUser
}

// Shaped like the Inspector login response in the spec; see docs/api-assumptions.md.
const loginResponseSchema = z.object({
    token: z.string().min(1),
    user: z.object({
        adminUserId: z.number(),
        tenantId: z.number(),
        username: z.string(),
        name: z.string(),
        surname: z.string(),
    }),
})

/** Stores the token for later requests and returns the signed-in user. */
export async function signIn(credentials: Credentials): Promise<Session> {
    const { token, user } = await request('/login', {
        method: 'POST',
        body: credentials,
        schema: loginResponseSchema,
    })
    setAccessToken(token)

    return {
        user: {
            id: user.adminUserId,
            tenantId: user.tenantId,
            username: user.username,
            firstName: user.name,
            lastName: user.surname,
        },
    }
}

interface UseSignInOptions {
    onSuccess: (session: Session) => void
}

export function useSignIn({ onSuccess }: UseSignInOptions) {
    // The credentials travel through a ref rather than as mutation variables, so the
    // password never enters the mutation cache. A held ref also means one request at a time.
    const credentialsRef = useRef<Credentials | null>(null)
    const mutation = useMutation({
        mutationFn: () => {
            if (credentialsRef.current === null) {
                throw new Error('signIn called without credentials')
            }

            return signIn(credentialsRef.current)
        },
        onSuccess,
        onSettled: () => {
            credentialsRef.current = null
        },
    })

    function signInOnce(credentials: Credentials): void {
        if (credentialsRef.current !== null) return

        credentialsRef.current = credentials
        mutation.mutate()
    }

    return { signIn: signInOnce, isPending: mutation.isPending, error: mutation.error }
}
