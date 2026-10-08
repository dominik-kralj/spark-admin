import { IconButton, Stack, useMediaQuery } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useEditAndDeleteOverlays } from '@/shared/lib/useEditAndDeleteOverlays'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { AddPrivilegedOwnerButton } from './AddPrivilegedOwnerButton'
import { PrivilegedOwnerDeleteDialog } from './PrivilegedOwnerDeleteDialog'
import { PrivilegedOwnerFormDrawer } from './PrivilegedOwnerFormDrawer'
import { PrivilegedOwnerList } from './PrivilegedOwnerList'

export function PrivilegedOwnersPage() {
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
    } = useEditAndDeleteOverlays<PrivilegedOwner>()
    // Focus after a delete goes to the add button on screen: text from md, icon below.
    const [isFromMd] = useMediaQuery(['(min-width: 768px)'], { ssr: false })

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
                        <AddPrivilegedOwnerButton
                            ref={isFromMd ? afterDeleteFocusRef : undefined}
                            onClick={openAddForm}
                        />
                        <IconButton
                            ref={isFromMd ? undefined : afterDeleteFocusRef}
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

            <PrivilegedOwnerList
                onAdd={openAddForm}
                onEdit={openForm}
                onDelete={openDeleteDialog}
            />

            <PrivilegedOwnerFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                owner={form.item}
                onClose={closeForm}
                onDelete={openDeleteDialog}
                finalFocusEl={focusAfterDelete}
            />

            <PrivilegedOwnerDeleteDialog
                key={`delete-${String(deleteDialog.key)}`}
                isOpen={deleteDialog.isOpen}
                owner={deleteDialog.item}
                onCancel={closeDeleteDialog}
                onDeleted={finishDelete}
                finalFocusEl={focusAfterDelete}
            />
        </Stack>
    )
}
