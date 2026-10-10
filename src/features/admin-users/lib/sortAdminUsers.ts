import type { SortDirection } from '@/shared/lib/useSortSearchParams'

import type { AdminUser } from '../validators/adminUser'

// Croatian order, so Č comes after C; base, so case does not split equal names.
const usernameCollator = new Intl.Collator('hr', { sensitivity: 'base' })

export function sortAdminUsersByUsername(
    users: AdminUser[],
    direction: SortDirection,
): AdminUser[] {
    const sorted = users.toSorted((a, b) => usernameCollator.compare(a.username, b.username))

    return direction === 'asc' ? sorted : sorted.reverse()
}
