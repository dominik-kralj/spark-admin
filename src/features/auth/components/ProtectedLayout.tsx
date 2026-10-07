import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { getSessionUser, onSessionEnd, type SessionEndReason } from '@/shared/api'
import { paths } from '@/shared/paths'

import { loginUrl, sessionExpiredState } from '../lib/sessionRedirects'

export function ProtectedLayout() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { pathname, search } = useLocation()
    const currentUrl = pathname + search

    useEffect(() => {
        async function leaveApp(reason: SessionEndReason) {
            if (reason === 'expired') {
                await navigate(loginUrl(currentUrl), { replace: true, state: sessionExpiredState })
            } else {
                await navigate(paths.login, { replace: true })
            }
        }

        return onSessionEnd((reason) => {
            void leaveApp(reason)
        })
    }, [navigate, currentUrl])

    // On unmount, once the screens' queries are gone; signed in means StrictMode's rehearsal.
    useEffect(
        () => () => {
            if (getSessionUser() === null) queryClient.clear()
        },
        [queryClient],
    )

    return <Outlet />
}
