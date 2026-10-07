import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { onSessionEnd, type SessionEndReason } from '@/api'
import { paths } from '@/shared/paths'

import { loginUrl, sessionExpiredState } from './sessionRedirects'

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
            // After leaving, so mounted queries can't refetch into the cleared cache.
            queryClient.clear()
        }

        return onSessionEnd((reason) => {
            void leaveApp(reason)
        })
    }, [navigate, queryClient, currentUrl])

    return <Outlet />
}
