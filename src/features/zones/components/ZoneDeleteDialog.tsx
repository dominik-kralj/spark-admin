import { Alert } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { toaster } from '@/shared/lib/toaster'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'

import { useDeleteZone } from '../api/useZones'
import { deleteErrorMessage } from '../lib/deleteErrorMessage'
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
                    <Alert.Root role="alert" status="error">
                        <Alert.Indicator>
                            <CircleAlert />
                        </Alert.Indicator>
                        <Alert.Description>
                            <strong>{t.zones.delete.failed}</strong>{' '}
                            {deleteErrorMessage(deleteZone.error, t)}
                        </Alert.Description>
                    </Alert.Root>
                )
            }
            onConfirm={() => {
                deleteZone.mutate(zone.id, {
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
