import { IconButton, Stack } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useEditAndDeleteOverlays } from '@/shared/lib/useEditAndDeleteOverlays'
import { PageHeader } from '@/shared/ui/PageHeader'

import type { AdminUser } from '../validators/adminUser'

import { AddAdminUserButton } from './AddAdminUserButton'
import { AdminUserFormDrawer } from './AdminUserFormDrawer'
import { AdminUserList } from './AdminUserList'

interface AdminUsersPageProps {
    /** Marks the signed-in user's own row; null when the session has no user. */
    signedInUserId: number | null
}

export function AdminUsersPage({ signedInUserId }: AdminUsersPageProps) {
    const t = useStrings()
    const { form, openForm, closeForm } = useEditAndDeleteOverlays<AdminUser>()

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
                        <AddAdminUserButton onClick={openAddForm} />
                        <IconButton
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

            <AdminUserList signedInUserId={signedInUserId} onAdd={openAddForm} onEdit={openForm} />

            <AdminUserFormDrawer
                key={`form-${String(form.key)}`}
                isOpen={form.isOpen}
                user={form.item}
                onClose={closeForm}
            />
        </Stack>
    )
}
