import { useStrings } from '@/shared/i18n/useStrings'
import { DeleteDialog } from '@/shared/ui/DeleteDialog'

import { useDeletePrivilegedOwner } from '../api/usePrivilegedOwners'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

interface PrivilegedOwnerDeleteDialogProps {
    isOpen: boolean
    owner: PrivilegedOwner | null
    onCancel: () => void
    onDeleted: () => void
    finalFocusEl: () => HTMLElement | null
}

export function PrivilegedOwnerDeleteDialog({
    owner,
    ...dialog
}: PrivilegedOwnerDeleteDialogProps) {
    const t = useStrings()
    const deleteOwner = useDeletePrivilegedOwner()
    const strings = t.privilegedOwners.delete

    if (owner === null) return null

    return (
        <DeleteDialog
            {...dialog}
            strings={{
                title: strings.title(owner.plate),
                description: strings.description(owner.plate, owner.ownerName),
                confirm: strings.confirm,
                failed: strings.failed,
                errors: strings.errors,
                deleted: strings.deleted(owner.plate),
            }}
            deletion={deleteOwner}
            id={owner.id}
        />
    )
}
