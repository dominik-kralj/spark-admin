import { Stack } from '@chakra-ui/react'
import { useState } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { Zone } from '../validators/zone'

import { AddZoneButton } from './AddZoneButton'
import { ZoneFormDrawer } from './ZoneFormDrawer'
import { ZoneList } from './ZoneList'

interface ZoneFormState {
    isOpen: boolean
    zone: Zone | null
    /** A new key per opening gives each form a fresh draft; closing keeps it, so the drawer animates out. */
    key: number
}

export function ZonesPage() {
    const t = useStrings()
    const [form, setForm] = useState<ZoneFormState>({ isOpen: false, zone: null, key: 0 })

    function openForm(zone: Zone | null) {
        setForm((current) => ({ isOpen: true, zone, key: current.key + 1 }))
    }

    function openAddForm() {
        openForm(null)
    }

    return (
        <Stack flex="1" minW="0" gap={{ base: '4', md: '5' }}>
            <PageHeader title={t.nav.zones} action={<AddZoneButton onClick={openAddForm} />} />

            <ZoneList onAdd={openAddForm} onEdit={openForm} />

            <ZoneFormDrawer
                key={form.key}
                isOpen={form.isOpen}
                zone={form.zone}
                onClose={() => {
                    setForm((current) => ({ ...current, isOpen: false }))
                }}
            />
        </Stack>
    )
}
