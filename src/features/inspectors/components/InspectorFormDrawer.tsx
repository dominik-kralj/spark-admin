import { Input, SimpleGrid, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { filterPin } from '@/shared/lib/validation'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { FormField } from '@/shared/ui/FormField'
import { SecretInput } from '@/shared/ui/SecretInput'

import { useCreateInspector, useUpdateInspector } from '../api/useInspectors'
import { fullName } from '../lib/fullName'
import { inspectorFieldMessage } from '../lib/inspectorFieldMessage'
import {
    toInspectorFieldErrors,
    type Inspector,
    type InspectorField,
} from '../validators/inspector'
import {
    editInspectorFormSchema,
    emptyInspectorForm,
    newInspectorFormSchema,
    toInspectorFormValues,
    toInspectorInput,
    type ValidInspectorFormValues,
} from '../validators/inspectorForm'

import { ActiveSwitch } from './ActiveSwitch'

interface InspectorFormDrawerProps {
    isOpen: boolean
    inspector: Inspector | null
    onClose: () => void
}

export function InspectorFormDrawer({ isOpen, inspector, onClose }: InspectorFormDrawerProps) {
    const t = useStrings()
    const createInspector = useCreateInspector()
    const updateInspector = useUpdateInspector()
    const [isConfirmingDeactivation, setIsConfirmingDeactivation] = useState(false)
    const isAdding = inspector === null
    const savedName = isAdding ? '' : fullName(inspector)
    const saveMutation = isAdding ? createInspector : updateInspector
    const {
        register,
        handleSubmit,
        setError,
        setValue,
        control,
        formState: { errors, isDirty, isSubmitting, submitCount },
    } = useForm({
        resolver: zodResolver(isAdding ? newInspectorFormSchema : editInspectorFormSchema),
        defaultValues: isAdding ? emptyInspectorForm : toInspectorFormValues(inspector),
        mode: 'onTouched',
    })

    const isActive = useWatch({ control, name: 'isActive' })

    const saveError = saveMutation.error
    const hasFieldErrors = Object.keys(toInspectorFieldErrors(saveError)).length > 0
    const hasInvalidFields = submitCount > 0 && Object.keys(errors).length > 0

    async function save(values: ValidInspectorFormValues) {
        const input = toInspectorInput(values)

        try {
            const saved = isAdding
                ? await createInspector.mutateAsync(input)
                : await updateInspector.mutateAsync({ id: inspector.id, ...input })
            toaster.success({ title: t.inspectors.form.saved(fullName(saved)) })
            onClose()
        } catch (error) {
            setServerFieldErrors(setError, toInspectorFieldErrors(error))
        }
    }

    function setActive(checked: boolean) {
        setValue('isActive', checked, { shouldDirty: true })
    }

    // Only switching off a saved, active inspector asks; cancelling switches it back on.
    function changeActive(checked: boolean) {
        setActive(checked)
        if (!checked && inspector?.isActive) setIsConfirmingDeactivation(true)
    }

    function fieldError(name: InspectorField) {
        return inspectorFieldMessage({ field: name, error: errors[name], t })
    }

    return (
        <FormDrawer
            isOpen={isOpen}
            title={isAdding ? t.inspectors.add : t.inspectors.editInspector(savedName)}
            isDirty={isDirty}
            isSaving={isSubmitting}
            isSaveDisabled={!isAdding && !isDirty}
            onClose={onClose}
            onSubmit={(event) => void handleSubmit(save)(event)}
        >
            <Text color="fg.muted">
                {isAdding ? t.inspectors.form.intro : t.inspectors.form.introEdit}
            </Text>

            {saveError && !hasFieldErrors && (
                <ErrorAlert
                    title={t.forms.saveFailed}
                    message={errorMessage(saveError, t.forms.errors)}
                    takesFocus
                />
            )}

            {hasInvalidFields && <ErrorAlert message={t.inspectors.form.notSaved} />}

            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="4" rowGap="5">
                <FormField label={t.inspectors.form.labels.name} error={fieldError('name')}>
                    {(fieldControl) => (
                        <Input {...register('name')} {...fieldControl} autoComplete="off" />
                    )}
                </FormField>
                <FormField label={t.inspectors.form.labels.surname} error={fieldError('surname')}>
                    {(fieldControl) => (
                        <Input {...register('surname')} {...fieldControl} autoComplete="off" />
                    )}
                </FormField>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="4">
                <FormField label={t.inspectors.form.labels.oib} error={fieldError('oib')}>
                    {(fieldControl) => (
                        <Input
                            {...register('oib')}
                            {...fieldControl}
                            inputMode="numeric"
                            autoComplete="off"
                            fontFamily="mono"
                        />
                    )}
                </FormField>
            </SimpleGrid>

            <FormField
                label={t.inspectors.form.labels.pin}
                helperText={isAdding ? t.inspectors.form.pinHelp : t.inspectors.form.pinHelpEdit}
                error={fieldError('pin')}
            >
                {(fieldControl) => (
                    <SecretInput
                        {...register('pin', {
                            onChange: (event: { target: { value: string } }) => {
                                setValue('pin', filterPin(event.target.value))
                            },
                        })}
                        {...fieldControl}
                        showLabel={t.inspectors.form.showPin}
                        inputMode="numeric"
                        autoComplete="off"
                        fontFamily="mono"
                        w="7.5rem"
                    />
                )}
            </FormField>

            <ActiveSwitch isActive={isActive} onChange={changeActive} />

            {!isAdding && (
                <ConfirmDialog
                    isOpen={isConfirmingDeactivation}
                    title={t.inspectors.deactivate.title(savedName)}
                    description={t.inspectors.deactivate.description(savedName)}
                    confirmLabel={t.inspectors.deactivate.confirm}
                    cancelLabel={t.forms.cancel}
                    tone="destructive"
                    onConfirm={() => {
                        setIsConfirmingDeactivation(false)
                    }}
                    onCancel={() => {
                        setActive(true)
                        setIsConfirmingDeactivation(false)
                    }}
                />
            )}
        </FormDrawer>
    )
}
