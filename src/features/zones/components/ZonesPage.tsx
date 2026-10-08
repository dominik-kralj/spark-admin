import { Stack } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useEditAndDeleteOverlays } from '@/shared/lib/useEditAndDeleteOverlays'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { Zone } from '../validators/zone'

import { AddZoneButton } from './AddZoneButton'
import { ZoneDeleteDialog } from './ZoneDeleteDialog'
import { ZoneFormDrawer } from './ZoneFormDrawer'
import { ZoneList } from './ZoneList'

export function ZonesPage() {
    const t = useStrings()
    const {
        form,
        deleteDialog,
        afterDeleteFocusRef,
        openForm,
        closeForm,
        openDeleteDialog,
        closeDeleteDialog,
        finishDelete,
        focusAfterDelete,
    } = useEditAndDeleteOverlays<Zone>()

    function openAddForm() {
        openForm(null)
    }

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader
                title={t.nav.zones}
                action={<AddZoneButton ref={afterDeleteFocusRef} onClick={openAddForm} />}
            />

            <ZoneList onAdd={openAddForm} onEdit={openForm} onDelete={openDeleteDialog} />

            <ZoneFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                zone={form.item}
                onClose={closeForm}
                onDelete={openDeleteDialog}
                finalFocusEl={focusAfterDelete}
            />

            <ZoneDeleteDialog
                key={`delete-${String(deleteDialog.key)}`}
                isOpen={deleteDialog.isOpen}
                zone={deleteDialog.item}
                onCancel={closeDeleteDialog}
                onDeleted={finishDelete}
                finalFocusEl={focusAfterDelete}
            />
        </Stack>
    )
}
