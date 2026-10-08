import { Button, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import type { HTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { FormField } from '@/shared/ui/FormField'

import { useCreateZone, useUpdateZone } from '../api/useZones'
import { zoneFieldMessage } from '../lib/zoneFieldMessage'
import { toZoneFieldErrors, type Zone, type ZoneField } from '../validators/zone'
import {
    emptyZoneForm,
    toZoneFormValues,
    toZoneInput,
    zoneFormSchema,
    type ValidZoneFormValues,
} from '../validators/zoneForm'

const fields: { name: ZoneField; inputMode: HTMLAttributes<HTMLInputElement>['inputMode'] }[] = [
    { name: 'code', inputMode: 'text' },
    { name: 'name', inputMode: 'text' },
    { name: 'price', inputMode: 'decimal' },
    { name: 'dailyTicketPrice', inputMode: 'decimal' },
    { name: 'durationMinutes', inputMode: 'numeric' },
    { name: 'maxExtensions', inputMode: 'numeric' },
    { name: 'dpkIssueDelayMinutes', inputMode: 'numeric' },
]

interface ZoneFormDrawerProps {
    isOpen: boolean
    zone: Zone | null
    onClose: () => void
    onDelete: (zone: Zone) => void
    finalFocusEl: () => HTMLElement | null
}

export function ZoneFormDrawer({
    isOpen,
    zone,
    onClose,
    onDelete,
    finalFocusEl,
}: ZoneFormDrawerProps) {
    const t = useStrings()
    const createZone = useCreateZone()
    const updateZone = useUpdateZone()
    const isAdding = zone === null
    const saveMutation = isAdding ? createZone : updateZone
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isDirty, isSubmitting, submitCount },
    } = useForm({
        resolver: zodResolver(zoneFormSchema),
        defaultValues: isAdding ? emptyZoneForm : toZoneFormValues(zone),
        mode: 'onTouched',
    })

    const saveError = saveMutation.error
    const hasFieldErrors = Object.keys(toZoneFieldErrors(saveError)).length > 0
    const hasInvalidFields = submitCount > 0 && Object.keys(errors).length > 0

    async function save(values: ValidZoneFormValues) {
        const input = toZoneInput(values)

        try {
            const saved = isAdding
                ? await createZone.mutateAsync(input)
                : await updateZone.mutateAsync({ id: zone.id, ...input })
            toaster.success({ title: t.zones.form.saved(saved.code) })
            onClose()
        } catch (error) {
            setServerFieldErrors(setError, toZoneFieldErrors(error))
        }
    }

    return (
        <FormDrawer
            isOpen={isOpen}
            title={isAdding ? t.zones.add : t.zones.editZone(zone.code)}
            isDirty={isDirty}
            isSaving={isSubmitting}
            isSaveDisabled={!isAdding && !isDirty}
            destructiveAction={
                !isAdding && (
                    <Button
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => {
                            onDelete(zone)
                        }}
                    >
                        <Trash2 aria-hidden="true" />
                        {t.zones.delete.formButton}
                    </Button>
                )
            }
            onClose={onClose}
            finalFocusEl={finalFocusEl}
            onSubmit={(event) => void handleSubmit(save)(event)}
        >
            <Text color="fg.muted">{t.zones.form.intro}</Text>

            {saveError && !hasFieldErrors && (
                <ErrorAlert
                    title={t.forms.saveFailed}
                    message={errorMessage(saveError, t.forms.errors)}
                    takesFocus
                />
            )}

            {hasInvalidFields && <ErrorAlert message={t.zones.form.notSaved} />}

            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="4" rowGap="5">
                {fields.map(({ name, inputMode }) => (
                    <FormField
                        key={name}
                        label={t.zones.form.labels[name]}
                        error={zoneFieldMessage({ field: name, error: errors[name], t })}
                    >
                        {(control) => (
                            <Input
                                {...register(name)}
                                {...control}
                                inputMode={inputMode}
                                autoComplete="off"
                            />
                        )}
                    </FormField>
                ))}
            </SimpleGrid>
        </FormDrawer>
    )
}
