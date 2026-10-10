import {
    Button,
    chakra,
    GridItem,
    Input,
    SimpleGrid,
    Stack,
    Text,
    type GridItemProps,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ComponentProps } from 'react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { toaster } from '@/shared/lib/toaster'
import { keepDecimal, keepDigits } from '@/shared/lib/validation'
import { useUnsavedChangesGuard } from '@/shared/lib/useUnsavedChangesGuard'
import { DiscardChangesDialog } from '@/shared/ui/DiscardChangesDialog'
import { FormField } from '@/shared/ui/FormField'
import { NavigationGuard } from '@/shared/ui/NavigationGuard'

import { useUpdateCitySettings } from '../api/useCitySettings'
import { citySettingsFieldMessage } from '../lib/citySettingsFieldMessage'
import {
    toCitySettingsFieldErrors,
    type CitySettings,
    type CitySettingsField,
} from '../validators/citySettings'
import { citySettingsFormSchema, toCitySettingsFormValues } from '../validators/citySettingsForm'

import { FormSection } from './FormSection'

const saveErrorToastId = 'city-settings-save-error'

// resetOptions keep a person's edits when a refetch lands; a save or a discard drops them.
const discardEdits = { keepDirtyValues: false }

interface FieldOptions {
    helperText?: string
    input?: ComponentProps<typeof Input>
    /** Drops what the field can never hold as it is typed. */
    filter?: (value: string) => string
    colSpan?: GridItemProps['colSpan']
}

// Two columns from md; four from xl, so a desktop window shows the whole form.
const gridColumns = { base: 1, md: 2, xl: 4 }
const half = { xl: 2 }

export function CitySettingsForm({ settings }: { settings: CitySettings }) {
    const t = useStrings()
    const updateCitySettings = useUpdateCitySettings()
    const {
        register,
        handleSubmit,
        reset,
        setError,
        setValue,
        formState: { errors, isDirty, isSubmitting },
    } = useForm({
        resolver: zodResolver(citySettingsFormSchema),
        values: toCitySettingsFormValues(settings),
        resetOptions: { keepDirtyValues: true },
        mode: 'onTouched',
    })
    const { guardLeave, dialog } = useUnsavedChangesGuard(isDirty)

    const submit = handleSubmit(save)

    async function save(values: CitySettings) {
        toaster.dismiss(saveErrorToastId)
        try {
            const saved = await updateCitySettings.mutateAsync(values)
            reset(toCitySettingsFormValues(saved), discardEdits)
            toaster.success({
                title: t.citySettings.saved,
                description: t.citySettings.savedDescription,
            })
        } catch (error) {
            if (setServerFieldErrors(setError, toCitySettingsFieldErrors(error))) return

            // It stays until closed or retried, so the retry cannot time out.
            toaster.error({
                id: saveErrorToastId,
                title: t.citySettings.notSaved,
                description: errorMessage(error, t.forms.errors),
                duration: Infinity,
                action: { label: t.listStates.retry, onClick: () => void submit() },
            })
        }
    }

    function fieldError(name: CitySettingsField) {
        return citySettingsFieldMessage({ field: name, error: errors[name], t })
    }

    function settingsField(
        name: CitySettingsField,
        { helperText, input, filter, colSpan }: FieldOptions = {},
    ) {
        const registration = register(name, {
            ...(filter && {
                onChange: (event: { target: { value: string } }) => {
                    setValue(name, filter(event.target.value), { shouldDirty: true })
                },
            }),
        })

        return (
            <GridItem colSpan={colSpan}>
                <FormField
                    label={t.citySettings.labels[name]}
                    helperText={helperText}
                    error={fieldError(name)}
                >
                    {(fieldControl) => (
                        <Input {...registration} {...fieldControl} autoComplete="off" {...input} />
                    )}
                </FormField>
            </GridItem>
        )
    }

    return (
        <chakra.form
            layerStyle="panel"
            aria-label={t.nav.citySettings}
            noValidate
            onSubmit={(event) => void submit(event)}
        >
            <Stack gap={{ base: '7', md: '8' }} p={{ base: '4', md: '6' }}>
                <Text color="fg.muted" mb={{ base: '-1', md: '-3' }}>
                    {t.citySettings.intro}
                </Text>

                <FormSection title={t.citySettings.sections.city}>
                    <SimpleGrid columns={gridColumns} columnGap="4" rowGap="5">
                        {settingsField('name', { colSpan: half })}
                        {settingsField('oib', {
                            helperText: t.citySettings.oibHelp,
                            input: { inputMode: 'numeric', fontFamily: 'mono' },
                            filter: keepDigits,
                            colSpan: half,
                        })}
                        {settingsField('street', { colSpan: half })}
                        {settingsField('houseNo')}
                        {settingsField('zipCode', {
                            input: { inputMode: 'numeric' },
                            filter: keepDigits,
                        })}
                        {settingsField('city', { colSpan: half })}
                        {settingsField('iban', {
                            helperText: t.citySettings.ibanHelp,
                            input: { fontFamily: 'mono' },
                            colSpan: { md: 2 },
                        })}
                    </SimpleGrid>
                </FormSection>

                <FormSection title={t.citySettings.sections.fiscalization}>
                    <SimpleGrid columns={gridColumns} columnGap="4" rowGap="5">
                        {settingsField('premisesCode')}
                        {settingsField('cashRegisterCode', {
                            input: { inputMode: 'numeric' },
                            filter: keepDigits,
                        })}
                        {settingsField('vatRate', {
                            input: { inputMode: 'decimal', maxW: { base: '120px', md: '160px' } },
                            filter: keepDecimal,
                        })}
                    </SimpleGrid>
                </FormSection>
            </Stack>

            <Stack
                direction={{ base: 'column-reverse', md: 'row' }}
                justify="flex-end"
                gap={{ base: '2', md: '3' }}
                px={{ base: '4', md: '6' }}
                py="4"
                borderTopWidth="1px"
                borderColor="border"
            >
                <Button
                    variant="outline"
                    disabled={!isDirty}
                    onClick={() => {
                        guardLeave(() => {
                            reset(undefined, discardEdits)
                        })
                    }}
                >
                    {t.forms.cancel}
                </Button>
                <Button
                    type="submit"
                    colorPalette="blue"
                    loading={isSubmitting}
                    loadingText={t.citySettings.save}
                    disabled={!isDirty}
                >
                    {t.citySettings.save}
                </Button>
            </Stack>

            <DiscardChangesDialog {...dialog} />
            <NavigationGuard hasUnsavedChanges={isDirty} />
        </chakra.form>
    )
}
