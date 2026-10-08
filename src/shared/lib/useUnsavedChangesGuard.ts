import { useState } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'

import { getSessionUser } from '@/shared/api'

export interface DiscardDialogState {
    isOpen: boolean
    onDiscard: () => void
    onKeepEditing: () => void
}

/**
 * Asks before changes are lost: on a close the form routes through `guardLeave`, on a route
 * change, and (through the browser's own prompt) on a reload or a closed tab.
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
    const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null)
    // Once the session has ended nothing can be saved, so the redirect to login goes through.
    const blocker = useBlocker(() => hasUnsavedChanges && getSessionUser() !== null)

    useBeforeUnload((event) => {
        if (hasUnsavedChanges) event.preventDefault()
    })

    function guardLeave(leave: () => void): void {
        if (hasUnsavedChanges) {
            setPendingLeave(() => leave)
        } else {
            leave()
        }
    }

    const dialog: DiscardDialogState = {
        isOpen: pendingLeave !== null || blocker.state === 'blocked',
        onDiscard: () => {
            setPendingLeave(null)
            if (blocker.state === 'blocked') blocker.proceed()
            pendingLeave?.()
        },
        onKeepEditing: () => {
            setPendingLeave(null)
            if (blocker.state === 'blocked') blocker.reset()
        },
    }

    return { guardLeave, dialog }
}
