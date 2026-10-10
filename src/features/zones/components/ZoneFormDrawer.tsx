import { Button, Input, SimpleGrid, Text, type InputProps } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { keepDecimal } from '@/shared/lib/validation'
import { wholeNumberInput } from '@/shared/lib/wholeNumberInput'
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

// Amounts stay text: a number input would not take the decimal comma everywhere.
const amount: InputProps = { inputMode: 'decimal' }

interface FieldConfig {
    name: ZoneField
    input?: InputProps
    /** Drops what the field can never hold as it is typed. */
    filter?: (value: string) => string
}

const fields: FieldConfig[] = [
    { name: 'code' },
    { name: 'name' },
    { name: 'price', input: amount, filter: keepDecimal },
    { name: 'dailyTicketPrice', input: amount, filter: keepDecimal },
    { name: 'durationMinutes', input: wholeNumberInput(1) },
    { name: 'maxExtensions', input: wholeNumberInput(0) },
    { name: 'dpkIssueDelayMinutes', input: wholeNumberInput(0) },
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
        setValue,
        formState: { errors, isDirty, isSubmitting },
    } = useForm({
        resolver: zodResolver(zoneFormSchema),
        defaultValues: isAdding ? emptyZoneForm : toZoneFormValues(zone),
        mode: 'onTouched',
    })

    const saveError = saveMutation.error
    const hasFieldErrors = Object.keys(toZoneFieldErrors(saveError)).length > 0

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

            <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="4" rowGap="5">
                {fields.map(({ name, input, filter }) => (
                    <FormField
                        key={name}
                        label={t.zones.form.labels[name]}
                        error={zoneFieldMessage({ field: name, error: errors[name], t })}
                    >
                        {(control) => (
                            <Input
                                {...register(name, {
                                    ...(filter && {
                                        onChange: (event: { target: { value: string } }) => {
                                            setValue(name, filter(event.target.value), {
                                                shouldDirty: true,
                                            })
                                        },
                                    }),
                                })}
                                {...control}
                                autoComplete="off"
                                {...input}
                            />
                        )}
                    </FormField>
                ))}
            </SimpleGrid>
        </FormDrawer>
    )
}
