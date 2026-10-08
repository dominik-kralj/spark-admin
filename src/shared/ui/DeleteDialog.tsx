import type { UseMutationResult } from '@tanstack/react-query'
import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage, type ErrorMessages } from '@/shared/lib/errorMessage'
import { toaster } from '@/shared/lib/toaster'

import { ConfirmDialog } from './ConfirmDialog'
import { ErrorAlert } from './ErrorAlert'

interface DeleteDialogProps {
    isOpen: boolean
    strings: {
        title: string
        description: string
        confirm: string
        failed: string
        errors: ErrorMessages
        deleted: string
    }
    deletion: UseMutationResult<void, Error, number>
    id: number
    onCancel: () => void
    onDeleted: () => void
    finalFocusEl: () => HTMLElement | null
}

/** Confirms a delete; a failure keeps the dialog open with the reason. */
export function DeleteDialog({
    isOpen,
    strings,
    deletion,
    id,
    onCancel,
    onDeleted,
    finalFocusEl,
}: DeleteDialogProps) {
    const t = useStrings()
    // isPending reaches the button a tick after mutate; this stops a press in between.
    const isRequestedRef = useRef(false)

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title={strings.title}
            description={strings.description}
            confirmLabel={strings.confirm}
            cancelLabel={t.forms.cancel}
            tone="destructive"
            isConfirming={deletion.isPending}
            error={
                deletion.error && (
                    <ErrorAlert
                        title={strings.failed}
                        message={errorMessage(deletion.error, strings.errors)}
                    />
                )
            }
            onConfirm={() => {
                if (isRequestedRef.current) return
                isRequestedRef.current = true
                deletion.mutate(id, {
                    onSettled: () => {
                        isRequestedRef.current = false
                    },
                    onSuccess: () => {
                        toaster.success({ title: strings.deleted })
                        onDeleted()
                    },
                })
            }}
            onCancel={onCancel}
            finalFocusEl={finalFocusEl}
        />
    )
}
