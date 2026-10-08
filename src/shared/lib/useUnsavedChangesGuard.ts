import { useState } from 'react'

export interface DiscardDialogState {
    isOpen: boolean
    onDiscard: () => void
    onKeepEditing: () => void
}

/** For closes inside the page; route changes and reloads go through NavigationGuard. */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
    const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null)

    function guardLeave(leave: () => void): void {
        if (hasUnsavedChanges) {
            setPendingLeave(() => leave)
        } else {
            leave()
        }
    }

    const dialog: DiscardDialogState = {
        isOpen: pendingLeave !== null,
        onDiscard: () => {
            setPendingLeave(null)
            pendingLeave?.()
        },
        onKeepEditing: () => {
            setPendingLeave(null)
        },
    }

    return { guardLeave, dialog }
}
