import { Stack } from '@chakra-ui/react'
import { useRef, useState } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { Zone } from '../validators/zone'

import { AddZoneButton } from './AddZoneButton'
import { ZoneDeleteDialog } from './ZoneDeleteDialog'
import { ZoneFormDrawer } from './ZoneFormDrawer'
import { ZoneList } from './ZoneList'

interface OverlayState {
    isOpen: boolean
    zone: Zone | null
    /** A new key per opening gives each overlay fresh state; closing keeps it, so it animates out. */
    key: number
}

const closedOverlay: OverlayState = { isOpen: false, zone: null, key: 0 }

function openOverlay(zone: Zone | null) {
    return (current: OverlayState): OverlayState => ({ isOpen: true, zone, key: current.key + 1 })
}

function closeOverlay(current: OverlayState): OverlayState {
    return { ...current, isOpen: false }
}

export function ZonesPage() {
    const t = useStrings()
    const [form, setForm] = useState(closedOverlay)
    const [deleteDialog, setDeleteDialog] = useState(closedOverlay)
    const addButtonRef = useRef<HTMLButtonElement>(null)
    const wasDeletedRef = useRef(false)

    function openForm(zone: Zone | null) {
        wasDeletedRef.current = false
        setForm(openOverlay(zone))
    }

    function openAddForm() {
        openForm(null)
    }

    function openDeleteDialog(zone: Zone) {
        wasDeletedRef.current = false
        setDeleteDialog(openOverlay(zone))
    }

    // The deleted zone's buttons are gone, so focus goes to the page's next action instead.
    function focusAfterDelete() {
        return wasDeletedRef.current ? addButtonRef.current : null
    }

    return (
        <Stack flex="1" minW="0" gap={{ base: '4', md: '5' }}>
            <PageHeader
                title={t.nav.zones}
                action={<AddZoneButton ref={addButtonRef} onClick={openAddForm} />}
            />

            <ZoneList onAdd={openAddForm} onEdit={openForm} onDelete={openDeleteDialog} />

            <ZoneFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                zone={form.zone}
                onClose={() => {
                    setForm(closeOverlay)
                }}
                onDelete={openDeleteDialog}
                finalFocusEl={focusAfterDelete}
            />

            <ZoneDeleteDialog
                key={`delete-${String(deleteDialog.key)}`}
                isOpen={deleteDialog.isOpen}
                zone={deleteDialog.zone}
                onCancel={() => {
                    setDeleteDialog(closeOverlay)
                }}
                onDeleted={() => {
                    wasDeletedRef.current = true
                    setDeleteDialog(closeOverlay)
                    setForm(closeOverlay)
                }}
                finalFocusEl={focusAfterDelete}
            />
        </Stack>
    )
}
