import { useStrings } from '@/shared/i18n/useStrings'
import { DeleteDialog } from '@/shared/ui/DeleteDialog'

import { useDeleteAdminUser } from '../api/useAdminUsers'
import type { AdminUser } from '../validators/adminUser'

interface AdminUserDeleteDialogProps {
    isOpen: boolean
    user: AdminUser | null
    onCancel: () => void
    onDeleted: () => void
    finalFocusEl: () => HTMLElement | null
}

export function AdminUserDeleteDialog({ user, ...dialog }: AdminUserDeleteDialogProps) {
    const t = useStrings()
    const deleteAdminUser = useDeleteAdminUser()
    const strings = t.adminUsers.delete

    if (user === null) return null

    return (
        <DeleteDialog
            {...dialog}
            strings={{
                title: strings.title(user.username),
                description: strings.description(user.username),
                confirm: strings.confirm,
                failed: strings.failed,
                errors: strings.errors,
                deleted: strings.deleted(user.username),
            }}
            deletion={deleteAdminUser}
            id={user.id}
        />
    )
}
