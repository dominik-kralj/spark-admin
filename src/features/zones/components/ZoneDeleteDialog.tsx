import { useStrings } from '@/shared/i18n/useStrings'
import { DeleteDialog } from '@/shared/ui/DeleteDialog'

import { useDeleteZone } from '../api/useZones'
import type { Zone } from '../validators/zone'

interface ZoneDeleteDialogProps {
    isOpen: boolean
    zone: Zone | null
    onCancel: () => void
    onDeleted: () => void
    finalFocusEl: () => HTMLElement | null
}

export function ZoneDeleteDialog({ zone, ...dialog }: ZoneDeleteDialogProps) {
    const t = useStrings()
    const deleteZone = useDeleteZone()
    const strings = t.zones.delete

    if (zone === null) return null

    return (
        <DeleteDialog
            {...dialog}
            strings={{
                title: strings.title(zone.code),
                description: strings.description(zone.code, zone.name),
                confirm: strings.confirm,
                failed: strings.failed,
                errors: strings.errors,
                deleted: strings.deleted(zone.code),
            }}
            deletion={deleteZone}
            id={zone.id}
        />
    )
}
