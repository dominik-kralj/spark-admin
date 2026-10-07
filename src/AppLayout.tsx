import { useState } from 'react'

import { getSession, useAuth } from '@/features/auth/api/useAuth'
import { AppShell } from '@/features/shell/components/AppShell'

// Wires auth into the shell here, since one feature never imports another.
export function AppLayout() {
    const { signOut } = useAuth()
    // requireSession has run, so the session is there; read once, not on every render.
    const [session] = useState(getSession)
    const userName = session ? `${session.user.firstName} ${session.user.lastName}` : ''

    return <AppShell userName={userName} onSignOut={signOut} />
}
