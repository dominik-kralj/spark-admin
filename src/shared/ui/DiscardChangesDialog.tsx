import { useStrings } from '@/shared/i18n/useStrings'
import type { DiscardDialogState } from '@/shared/lib/useUnsavedChangesGuard'

import { ConfirmDialog } from './ConfirmDialog'

export function DiscardChangesDialog({ isOpen, onDiscard, onKeepEditing }: DiscardDialogState) {
    const t = useStrings()

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title={t.forms.discard.title}
            description={t.forms.discard.description}
            confirmLabel={t.forms.discard.confirm}
            cancelLabel={t.forms.discard.keepEditing}
            tone="discard"
            onConfirm={onDiscard}
            onCancel={onKeepEditing}
        />
    )
}
