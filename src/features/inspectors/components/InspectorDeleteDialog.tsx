import { useStrings } from '@/shared/i18n/useStrings'
import { fullName } from '@/shared/lib/fullName'
import { DeleteDialog } from '@/shared/ui/DeleteDialog'

import { useDeleteInspector } from '../api/useInspectors'
import type { Inspector } from '../validators/inspector'

interface InspectorDeleteDialogProps {
    isOpen: boolean
    inspector: Inspector | null
    onCancel: () => void
    onDeleted: () => void
    finalFocusEl: () => HTMLElement | null
}

export function InspectorDeleteDialog({ inspector, ...dialog }: InspectorDeleteDialogProps) {
    const t = useStrings()
    const deleteInspector = useDeleteInspector()
    const strings = t.inspectors.delete

    if (inspector === null) return null

    const name = fullName(inspector)

    return (
        <DeleteDialog
            {...dialog}
            strings={{
                title: strings.title(name),
                description: strings.description(name),
                confirm: strings.confirm,
                failed: strings.failed,
                errors: strings.errors,
                deleted: strings.deleted(name),
            }}
            deletion={deleteInspector}
            id={inspector.id}
        />
    )
}
