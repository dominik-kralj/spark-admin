import { useState } from 'react'

import { AdminUsersPage } from '@/features/admin-users/components/AdminUsersPage'
import { getSession } from '@/features/auth/api/useAuth'

// Wires the signed-in user into Korisnici here, since one feature never imports another.
export function AdminUsersRoute() {
    // requireSession has run, so the session is there; read once, not on every render.
    const [session] = useState(getSession)

    return <AdminUsersPage signedInUserId={session?.user.id ?? null} />
}
