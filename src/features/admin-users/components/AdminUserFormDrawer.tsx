import { Button, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { FormField } from '@/shared/ui/FormField'
import { SecretInput } from '@/shared/ui/SecretInput'

import { useCreateAdminUser, useUpdateAdminUser } from '../api/useAdminUsers'
import { adminUserFieldMessage } from '../lib/adminUserFieldMessage'
import { toAdminUserFieldErrors, type AdminUser } from '../validators/adminUser'
import {
    adminUserFormSchema,
    emptyAdminUserForm,
    toAdminUserCreateInput,
    toAdminUserFormValues,
    toAdminUserUpdateInput,
    type AdminUserFormField,
    type ValidAdminUserFormValues,
} from '../validators/adminUserForm'

interface AdminUserFormDrawerProps {
    isOpen: boolean
    user: AdminUser | null
    /** False for the signed-in user, who cannot delete their own account. */
    canDelete: boolean
    onClose: () => void
    onDelete: (user: AdminUser) => void
    finalFocusEl: () => HTMLElement | null
}

export function AdminUserFormDrawer({
    isOpen,
    user,
    canDelete,
    onClose,
    onDelete,
    finalFocusEl,
}: AdminUserFormDrawerProps) {
    const t = useStrings()
    const { form: strings } = t.adminUsers
    const createAdminUser = useCreateAdminUser()
    const updateAdminUser = useUpdateAdminUser()
    const isAdding = user === null
    const saveMutation = isAdding ? createAdminUser : updateAdminUser
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isDirty, isSubmitting },
    } = useForm({
        resolver: zodResolver(adminUserFormSchema({ isAdding })),
        defaultValues: isAdding ? emptyAdminUserForm : toAdminUserFormValues(user),
        mode: 'onTouched',
    })

    const saveError = saveMutation.error
    const hasFieldErrors = Object.keys(toAdminUserFieldErrors(saveError)).length > 0

    async function save(values: ValidAdminUserFormValues) {
        try {
            const saved = isAdding
                ? await createAdminUser.mutateAsync(toAdminUserCreateInput(values))
                : await updateAdminUser.mutateAsync({
                      id: user.id,
                      ...toAdminUserUpdateInput(values),
                  })
            toaster.success({ title: strings.saved(saved.username) })
            onClose()
        } catch (error) {
            setServerFieldErrors(setError, toAdminUserFieldErrors(error))
        }
    }

    function fieldError(name: AdminUserFormField) {
        return adminUserFieldMessage({ field: name, error: errors[name], t })
    }

    return (
        <FormDrawer
            isOpen={isOpen}
            title={isAdding ? t.adminUsers.add : t.adminUsers.editAdminUser(user.username)}
            isDirty={isDirty}
            isSaving={isSubmitting}
            destructiveAction={
                !isAdding &&
                canDelete && (
                    <Button
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => {
                            onDelete(user)
                        }}
                    >
                        <Trash2 aria-hidden="true" />
                        {t.adminUsers.delete.formButton}
                    </Button>
                )
            }
            onClose={onClose}
            finalFocusEl={finalFocusEl}
            onSubmit={(event) => void handleSubmit(save)(event)}
        >
            <Text color="fg.muted">{isAdding ? strings.intro : strings.editIntro}</Text>

            {saveError && !hasFieldErrors && (
                <ErrorAlert
                    title={t.forms.saveFailed}
                    message={errorMessage(saveError, t.forms.errors)}
                    takesFocus
                />
            )}

            <FormField
                label={strings.labels.username}
                helperText={isAdding ? undefined : strings.usernameFixed}
                error={fieldError('username')}
            >
                {(fieldControl) => (
                    <Input
                        {...register('username')}
                        {...fieldControl}
                        readOnly={!isAdding}
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                    />
                )}
            </FormField>

            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="4" rowGap="5">
                <FormField label={strings.labels.name} error={fieldError('name')}>
                    {(fieldControl) => (
                        <Input {...register('name')} {...fieldControl} autoComplete="off" />
                    )}
                </FormField>
                <FormField label={strings.labels.surname} error={fieldError('surname')}>
                    {(fieldControl) => (
                        <Input {...register('surname')} {...fieldControl} autoComplete="off" />
                    )}
                </FormField>
            </SimpleGrid>

            <FormField
                label={isAdding ? strings.labels.password : strings.labels.newPassword}
                helperText={isAdding ? strings.passwordHelp : strings.newPasswordHelp}
                error={fieldError('password')}
            >
                {(fieldControl) => (
                    <SecretInput
                        {...register('password', { deps: 'confirmPassword' })}
                        {...fieldControl}
                        showLabel={strings.showPassword}
                        autoComplete="new-password"
                    />
                )}
            </FormField>

            <FormField
                label={
                    isAdding ? strings.labels.confirmPassword : strings.labels.confirmNewPassword
                }
                error={fieldError('confirmPassword')}
            >
                {(fieldControl) => (
                    <SecretInput
                        {...register('confirmPassword')}
                        {...fieldControl}
                        showLabel={strings.showConfirmPassword}
                        autoComplete="new-password"
                    />
                )}
            </FormField>
        </FormDrawer>
    )
}
