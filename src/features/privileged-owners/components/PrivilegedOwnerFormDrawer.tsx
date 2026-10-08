import { Input, SimpleGrid, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { normalisePlate } from '@/shared/lib/validation'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { FormField } from '@/shared/ui/FormField'

import { useCreatePrivilegedOwner, useUpdatePrivilegedOwner } from '../api/usePrivilegedOwners'
import { privilegedOwnerFieldMessage } from '../lib/privilegedOwnerFieldMessage'
import { validityOf } from '../lib/validity'
import {
    toPrivilegedOwnerFieldErrors,
    type PrivilegedOwner,
    type PrivilegedOwnerField,
} from '../validators/privilegedOwner'
import {
    emptyPrivilegedOwnerForm,
    privilegedOwnerFormSchema,
    toPrivilegedOwnerFormValues,
    toPrivilegedOwnerInput,
    type ValidPrivilegedOwnerFormValues,
} from '../validators/privilegedOwnerForm'

import { ExpiredNote } from './ExpiredNote'

type InputMode = HTMLAttributes<HTMLInputElement>['inputMode']

// Rows of the form: fields that belong together share a row from md up.
const fieldRows: { name: PrivilegedOwnerField; inputMode: InputMode }[][] = [
    [
        { name: 'plate', inputMode: 'text' },
        { name: 'validUntil', inputMode: 'numeric' },
    ],
    [{ name: 'ownerName', inputMode: 'text' }],
    [
        { name: 'street', inputMode: 'text' },
        { name: 'houseNo', inputMode: 'text' },
    ],
    [
        { name: 'zipCode', inputMode: 'numeric' },
        { name: 'city', inputMode: 'text' },
    ],
]

interface PrivilegedOwnerFormDrawerProps {
    isOpen: boolean
    owner: PrivilegedOwner | null
    onClose: () => void
}

export function PrivilegedOwnerFormDrawer({
    isOpen,
    owner,
    onClose,
}: PrivilegedOwnerFormDrawerProps) {
    const t = useStrings()
    const createOwner = useCreatePrivilegedOwner()
    const updateOwner = useUpdatePrivilegedOwner()
    const isAdding = owner === null
    const saveMutation = isAdding ? createOwner : updateOwner
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        formState: { errors, isDirty, isSubmitting, submitCount },
    } = useForm({
        resolver: zodResolver(privilegedOwnerFormSchema),
        defaultValues: isAdding ? emptyPrivilegedOwnerForm : toPrivilegedOwnerFormValues(owner),
        mode: 'onTouched',
    })

    const saveError = saveMutation.error
    const hasFieldErrors = Object.keys(toPrivilegedOwnerFieldErrors(saveError)).length > 0
    const hasInvalidFields = submitCount > 0 && Object.keys(errors).length > 0
    const isExpired = !isAdding && validityOf(owner, new Date()) === 'expired'
    const helperTexts: Partial<Record<PrivilegedOwnerField, string>> = {
        plate: t.privilegedOwners.form.plateHelp,
        validUntil: t.privilegedOwners.form.dateHelp,
    }

    async function save(values: ValidPrivilegedOwnerFormValues) {
        const input = toPrivilegedOwnerInput(values)

        try {
            const saved = isAdding
                ? await createOwner.mutateAsync(input)
                : await updateOwner.mutateAsync({ id: owner.id, ...input })
            toaster.success({ title: t.privilegedOwners.form.saved(saved.plate) })
            onClose()
        } catch (error) {
            setServerFieldErrors(setError, toPrivilegedOwnerFieldErrors(error))
        }
    }

    function registerField(name: PrivilegedOwnerField) {
        if (name !== 'plate') return register(name)

        return register(name, {
            onBlur: (event: { target: { value: string } }) => {
                setValue(name, normalisePlate(event.target.value), { shouldDirty: true })
            },
        })
    }

    return (
        <FormDrawer
            isOpen={isOpen}
            title={
                isAdding ? t.privilegedOwners.addLong : t.privilegedOwners.editOwner(owner.plate)
            }
            isDirty={isDirty}
            isSaving={isSubmitting}
            isSaveDisabled={!isAdding && !isDirty}
            onClose={onClose}
            onSubmit={(event) => void handleSubmit(save)(event)}
        >
            {isExpired && <ExpiredNote validUntil={owner.validUntil} />}

            <Text color="fg.muted">{t.privilegedOwners.form.intro}</Text>

            {saveError && !hasFieldErrors && (
                <ErrorAlert
                    title={t.forms.saveFailed}
                    message={errorMessage(saveError, t.forms.errors)}
                    takesFocus
                />
            )}

            {hasInvalidFields && <ErrorAlert message={t.privilegedOwners.form.notSaved} />}

            {fieldRows.map((row) => (
                <SimpleGrid
                    key={row[0]?.name}
                    columns={{ base: 1, md: row.length }}
                    columnGap="4"
                    rowGap="5"
                >
                    {row.map(({ name, inputMode }) => (
                        <FormField
                            key={name}
                            label={t.privilegedOwners.form.labels[name]}
                            helperText={helperTexts[name]}
                            error={privilegedOwnerFieldMessage({
                                field: name,
                                error: errors[name],
                                t,
                            })}
                        >
                            {(control) => (
                                <Input
                                    {...registerField(name)}
                                    {...control}
                                    inputMode={inputMode}
                                    autoComplete="off"
                                    fontFamily={name === 'plate' ? 'mono' : undefined}
                                />
                            )}
                        </FormField>
                    ))}
                </SimpleGrid>
            ))}
        </FormDrawer>
    )
}
