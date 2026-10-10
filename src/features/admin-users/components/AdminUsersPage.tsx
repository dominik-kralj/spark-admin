import { IconButton, Stack, useMediaQuery } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useEditAndDeleteOverlays } from '@/shared/lib/useEditAndDeleteOverlays'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { AdminUser } from '../validators/adminUser'

import { AddAdminUserButton } from './AddAdminUserButton'
import { AdminUserDeleteDialog } from './AdminUserDeleteDialog'
import { AdminUserFormDrawer } from './AdminUserFormDrawer'
import { AdminUserList } from './AdminUserList'

interface AdminUsersPageProps {
    /** Marks the signed-in user's own row; null when the session has no user. */
    signedInUserId: number | null
}

export function AdminUsersPage({ signedInUserId }: AdminUsersPageProps) {
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
    } = useEditAndDeleteOverlays<AdminUser>()
    // Focus after a delete goes to the add button on screen: text from md, icon below.
    const [isFromMd] = useMediaQuery(['(min-width: 768px)'], { ssr: false })

    function openAddForm() {
        openForm(null)
    }

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader
                title={t.nav.adminUsers}
                description={t.adminUsers.description}
                action={
                    <>
                        <AddAdminUserButton
                            ref={isFromMd ? afterDeleteFocusRef : undefined}
                            onClick={openAddForm}
                        />
                        <IconButton
                            ref={isFromMd ? undefined : afterDeleteFocusRef}
                            hideFrom="md"
                            aria-label={t.adminUsers.add}
                            colorPalette="blue"
                            onClick={openAddForm}
                        >
                            <Plus aria-hidden="true" />
                        </IconButton>
                    </>
                }
            />

            <AdminUserList
                signedInUserId={signedInUserId}
                onAdd={openAddForm}
                onEdit={openForm}
                onDelete={openDeleteDialog}
            />

            <AdminUserFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                user={form.item}
                canDelete={form.item?.id !== signedInUserId}
                onClose={closeForm}
                onDelete={openDeleteDialog}
                finalFocusEl={focusAfterDelete}
            />

            <AdminUserDeleteDialog
                key={`delete-${String(deleteDialog.key)}`}
                isOpen={deleteDialog.isOpen}
                user={deleteDialog.item}
                onCancel={closeDeleteDialog}
                onDeleted={finishDelete}
                finalFocusEl={focusAfterDelete}
            />
        </Stack>
    )
}
