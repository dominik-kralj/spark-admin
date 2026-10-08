import { Input, SimpleGrid, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { FormAlert } from '@/shared/ui/FormAlert'
import { FormDrawer } from '@/shared/ui/FormDrawer'
import { FormErrorNotice } from '@/shared/ui/FormErrorNotice'
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

const fields: { name: ZoneField; inputMode: 'text' | 'decimal' | 'numeric' }[] = [
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
    /** The zone to edit, or null to add one. */
    zone: Zone | null
    onClose: () => void
}

export function ZoneFormDrawer({ isOpen, zone, onClose }: ZoneFormDrawerProps) {
    const t = useStrings()
    const createZone = useCreateZone()
    const updateZone = useUpdateZone()
    const saveMutation = zone === null ? createZone : updateZone
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isDirty, isSubmitting, submitCount },
    } = useForm({
        resolver: zodResolver(zoneFormSchema),
        defaultValues: zone === null ? emptyZoneForm : toZoneFormValues(zone),
        // Validates on leaving a field, then on every change, so an error clears once fixed.
        mode: 'onTouched',
    })

    const saveError = saveMutation.error
    const hasFieldErrors = Object.keys(toZoneFieldErrors(saveError)).length > 0
    const hasInvalidFields = submitCount > 0 && Object.keys(errors).length > 0

    async function save(values: ValidZoneFormValues) {
        const input = toZoneInput(values)

        try {
            const saved =
                zone === null
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
            title={zone === null ? t.zones.add : t.zones.editZone(zone.code)}
            isDirty={isDirty}
            isSaving={isSubmitting}
            isSaveDisabled={zone !== null && !isDirty}
            onClose={onClose}
            onSubmit={(event) => void handleSubmit(save)(event)}
        >
            <Text color="fg.muted">{t.zones.form.intro}</Text>

            {saveError && !hasFieldErrors && <FormAlert error={saveError} />}

            {hasInvalidFields && <FormErrorNotice message={t.zones.form.notSaved} />}

            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="4" rowGap="5">
                {fields.map(({ name, inputMode }) => (
                    <FormField
                        key={name}
                        label={t.zones.form.labels[name]}
                        error={zoneFieldMessage(name, errors[name], t)}
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
