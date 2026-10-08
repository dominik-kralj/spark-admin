import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { toaster } from '@/shared/lib/toaster'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'

import { useDeleteZone } from '../api/useZones'
import type { Zone } from '../validators/zone'

interface ZoneDeleteDialogProps {
    isOpen: boolean
    zone: Zone | null
    onCancel: () => void
    onDeleted: () => void
    finalFocusEl: () => HTMLElement | null
}

export function ZoneDeleteDialog({
    isOpen,
    zone,
    onCancel,
    onDeleted,
    finalFocusEl,
}: ZoneDeleteDialogProps) {
    const t = useStrings()
    const deleteZone = useDeleteZone()
    // isPending reaches the button a tick after mutate; this stops a press in between.
    const isRequestedRef = useRef(false)

    if (zone === null) return null

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title={t.zones.delete.title(zone.code)}
            description={t.zones.delete.description(zone.code, zone.name)}
            confirmLabel={t.zones.delete.confirm}
            cancelLabel={t.forms.cancel}
            tone="destructive"
            isConfirming={deleteZone.isPending}
            error={
                deleteZone.error && (
                    <ErrorAlert
                        title={t.zones.delete.failed}
                        message={errorMessage(deleteZone.error, t.zones.delete.errors)}
                    />
                )
            }
            onConfirm={() => {
                if (isRequestedRef.current) return
                isRequestedRef.current = true
                deleteZone.mutate(zone.id, {
                    onSettled: () => {
                        isRequestedRef.current = false
                    },
                    onSuccess: () => {
                        toaster.success({ title: t.zones.delete.deleted(zone.code) })
                        onDeleted()
                    },
                })
            }}
            onCancel={onCancel}
            finalFocusEl={finalFocusEl}
        />
    )
}
