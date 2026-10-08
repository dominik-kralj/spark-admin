import { Box, IconButton, Stack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { AddPrivilegedOwnerButton } from './AddPrivilegedOwnerButton'
import { PrivilegedOwnerFormDrawer } from './PrivilegedOwnerFormDrawer'
import { PrivilegedOwnerList } from './PrivilegedOwnerList'

interface FormState {
    isOpen: boolean
    owner: PrivilegedOwner | null
    /** A new key per opening gives the form fresh state; closing keeps it, so it animates out. */
    key: number
}

const closedForm: FormState = { isOpen: false, owner: null, key: 0 }

export function PrivilegedOwnersPage() {
    const t = useStrings()
    const [form, setForm] = useState(closedForm)

    function openForm(owner: PrivilegedOwner | null) {
        setForm((current) => ({ isOpen: true, owner, key: current.key + 1 }))
    }

    function openAddForm() {
        openForm(null)
    }

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader
                title={t.nav.privilegedOwners}
                description={t.privilegedOwners.description}
                action={
                    <>
                        <Box hideBelow="md">
                            <AddPrivilegedOwnerButton onClick={openAddForm} />
                        </Box>
                        <IconButton
                            hideFrom="md"
                            aria-label={t.privilegedOwners.addLong}
                            colorPalette="blue"
                            onClick={openAddForm}
                        >
                            <Plus aria-hidden="true" />
                        </IconButton>
                    </>
                }
            />

            <PrivilegedOwnerList onAdd={openAddForm} onEdit={openForm} />

            <PrivilegedOwnerFormDrawer
                key={form.key}
                isOpen={form.isOpen}
                owner={form.owner}
                onClose={() => {
                    setForm((current) => ({ ...current, isOpen: false }))
                }}
            />
        </Stack>
    )
}
