import { IconButton, Stack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useEditAndDeleteOverlays } from '@/shared/lib/useEditAndDeleteOverlays'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { Inspector } from '../validators/inspector'

import { AddInspectorButton } from './AddInspectorButton'
import { InspectorFormDrawer } from './InspectorFormDrawer'
import { InspectorList } from './InspectorList'

export function InspectorsPage() {
    const t = useStrings()
    // Inspectors are deactivated, never deleted, so only the form is used.
    const { form, openForm, closeForm } = useEditAndDeleteOverlays<Inspector>()

    function openAddForm() {
        openForm(null)
    }

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader
                title={t.nav.inspectors}
                description={t.inspectors.description}
                action={
                    <>
                        <AddInspectorButton onClick={openAddForm} />
                        <IconButton
                            hideFrom="md"
                            aria-label={t.inspectors.add}
                            colorPalette="blue"
                            onClick={openAddForm}
                        >
                            <Plus aria-hidden="true" />
                        </IconButton>
                    </>
                }
            />

            <InspectorList onAdd={openAddForm} onEdit={openForm} />

            <InspectorFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                inspector={form.item}
                onClose={closeForm}
            />
        </Stack>
    )
}
