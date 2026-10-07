import { redirect, type LoaderFunctionArgs } from 'react-router'

import { getSession } from '@/api'
import { paths } from '@/shared/paths'

const returnParam = 'next'

export const sessionExpiredState = { sessionExpired: true }

export function isSessionExpiredState(state: unknown): boolean {
    return typeof state === 'object' && state !== null && 'sessionExpired' in state
}

export function loginUrl(returnTo: string): string {
    if (returnTo === paths.home) return paths.login

    return `${paths.login}?${new URLSearchParams({ [returnParam]: returnTo }).toString()}`
}

export function returnPathFrom(searchParams: URLSearchParams): string {
    const returnTo = searchParams.get(returnParam)
    // "//host" and "/\host" are paths a browser resolves to another site.
    const isSameSite =
        returnTo?.startsWith('/') === true &&
        !returnTo.startsWith('//') &&
        !returnTo.startsWith('/\\')

    return isSameSite ? returnTo : paths.home
}

export function requireSession({ url }: LoaderFunctionArgs): Response | null {
    if (getSession()) return null

    return redirect(loginUrl(url.pathname + url.search))
}

export function redirectIfSignedIn(): Response | null {
    return getSession() ? redirect(paths.home) : null
}
