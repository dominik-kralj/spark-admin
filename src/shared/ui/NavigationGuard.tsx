import { useBeforeUnload, useBlocker } from 'react-router'

import { getSessionUser } from '@/shared/api'

import { DiscardChangesDialog } from './DiscardChangesDialog'

/** Mount it only while its form is on screen: React Router runs one blocker at a time. */
export function NavigationGuard({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) {
    // Once the session has ended nothing can be saved, so the redirect to login goes through.
    const blocker = useBlocker(() => hasUnsavedChanges && getSessionUser() !== null)

    useBeforeUnload((event) => {
        if (hasUnsavedChanges) event.preventDefault()
    })

    return (
        <DiscardChangesDialog
            isOpen={blocker.state === 'blocked'}
            onDiscard={() => {
                blocker.proceed?.()
            }}
            onKeepEditing={() => {
                blocker.reset?.()
            }}
        />
    )
}
