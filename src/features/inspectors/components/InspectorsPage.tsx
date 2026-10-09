import { IconButton, Stack, useMediaQuery } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useEditAndDeleteOverlays } from '@/shared/lib/useEditAndDeleteOverlays'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { Inspector } from '../validators/inspector'

import { AddInspectorButton } from './AddInspectorButton'
import { InspectorDeleteDialog } from './InspectorDeleteDialog'
import { InspectorFormDrawer } from './InspectorFormDrawer'
import { InspectorList } from './InspectorList'

export function InspectorsPage() {
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
    } = useEditAndDeleteOverlays<Inspector>()
    // Focus after a delete goes to the add button on screen: text from md, icon below.
    const [isFromMd] = useMediaQuery(['(min-width: 768px)'], { ssr: false })

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
                        <AddInspectorButton
                            ref={isFromMd ? afterDeleteFocusRef : undefined}
                            onClick={openAddForm}
                        />
                        <IconButton
                            ref={isFromMd ? undefined : afterDeleteFocusRef}
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

            <InspectorList onAdd={openAddForm} onEdit={openForm} onDelete={openDeleteDialog} />

            <InspectorFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                inspector={form.item}
                onClose={closeForm}
                onDelete={openDeleteDialog}
                finalFocusEl={focusAfterDelete}
            />

            <InspectorDeleteDialog
                key={`delete-${String(deleteDialog.key)}`}
                isOpen={deleteDialog.isOpen}
                inspector={deleteDialog.item}
                onCancel={closeDeleteDialog}
                onDeleted={finishDelete}
                finalFocusEl={focusAfterDelete}
            />
        </Stack>
    )
}
