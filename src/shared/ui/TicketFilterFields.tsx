import { IconButton, Input, InputGroup, NativeSelect } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useWatch } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { processingStatuses } from '@/shared/lib/processingStatus'
import { normalisePlate, readDateText } from '@/shared/lib/validation'
import { DateInput } from '@/shared/ui/DateInput'
import { FormField, type FieldControlProps } from '@/shared/ui/FormField'

import { useZoneOptions } from '@/shared/lib/useZoneOptions'
import { dateFilterError, type DateFilterName } from '@/shared/lib/dateFilterError'
import type { TicketFilterForm } from '@/shared/lib/useTicketFilterForm'

interface FilterFieldProps {
    form: TicketFilterForm
}

interface PlateFilterFieldProps extends FilterFieldProps {
    onClear: () => void
}

export function PlateFilterField({ form, onClear }: PlateFilterFieldProps) {
    const t = useStrings()
    const f = t.ticketFilters
    const plate = useWatch({ control: form.control, name: 'plate' })

    return (
        <FormField label={f.plate}>
            {(control) => (
                <InputGroup
                    startElement={<Search size="16" aria-hidden="true" />}
                    endElement={
                        plate !== '' && (
                            <IconButton
                                aria-label={f.clearPlate}
                                variant="ghost"
                                size="xs"
                                onClick={onClear}
                            >
                                <X aria-hidden="true" />
                            </IconButton>
                        )
                    }
                    endElementProps={{ pe: '1', pointerEvents: 'auto' }}
                >
                    <Input
                        {...form.register('plate', {
                            onBlur: (event: { target: { value: string } }) => {
                                form.setValue('plate', normalisePlate(event.target.value))
                            },
                        })}
                        {...control}
                        type="search"
                        autoComplete="off"
                        placeholder={f.platePlaceholder}
                        fontFamily="mono"
                    />
                </InputGroup>
            )}
        </FormField>
    )
}

interface DateFilterFieldProps extends FilterFieldProps {
    name: DateFilterName
    /** The bar lists its errors in one alert above it; the drawer shows each under its field. */
    isErrorInAlert?: boolean
}

export function DateFilterField({ form, name, isErrorInAlert = false }: DateFilterFieldProps) {
    const t = useStrings()
    const label = t.ticketFilters[name]
    const typedDate = useWatch({ control: form.control, name })
    const otherDate = readDateText(
        useWatch({ control: form.control, name: name === 'from' ? 'to' : 'from' }),
    )
    // The calendar offers only days that keep the range in order.
    const bound = 'date' in otherDate ? otherDate.date : undefined

    return (
        <FormField
            label={label}
            error={dateFilterError(form, name, t)}
            isErrorTextHidden={isErrorInAlert}
        >
            {(control) => (
                <DateInput
                    label={label}
                    value={typedDate}
                    min={name === 'to' ? bound : undefined}
                    max={name === 'from' ? bound : undefined}
                    onPick={(picked) => {
                        form.setValue(name, picked, {
                            shouldDirty: true,
                            shouldValidate: form.formState.isSubmitted,
                        })
                    }}
                >
                    <Input
                        // The range rule sits on "to", so a new start checks it again.
                        {...form.register(name, { deps: name === 'from' ? ['to'] : [] })}
                        {...control}
                        inputMode="numeric"
                        autoComplete="off"
                    />
                </DateInput>
            )}
        </FormField>
    )
}

interface SelectFilterFieldProps extends FilterFieldProps {
    name: 'zoneId' | 'fiscalStatus'
    label: string
    children: ReactNode
}

// Controlled, so a value from the URL shows once its option arrives with the zones.
function SelectFilterField({ form, name, label, children }: SelectFilterFieldProps) {
    return (
        <FormField label={label}>
            {(control: FieldControlProps) => (
                <NativeSelect.Root>
                    <Controller
                        control={form.control}
                        name={name}
                        render={({ field }) => (
                            <NativeSelect.Field {...field} {...control}>
                                {children}
                            </NativeSelect.Field>
                        )}
                    />
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
            )}
        </FormField>
    )
}

export function ZoneFilterField({ form }: FilterFieldProps) {
    const t = useStrings()
    const zones = useZoneOptions()

    return (
        <SelectFilterField form={form} name="zoneId" label={t.ticketFilters.zone}>
            <option value="">{t.ticketFilters.allZones}</option>
            {zones.data?.map((zone) => (
                <option key={zone.id} value={String(zone.id)}>
                    {zone.code}
                </option>
            ))}
        </SelectFilterField>
    )
}

export function FiscalFilterField({ form }: FilterFieldProps) {
    const t = useStrings()

    return (
        <SelectFilterField form={form} name="fiscalStatus" label={t.ticketFilters.fiscal}>
            <option value="">{t.ticketFilters.allStatuses}</option>
            {processingStatuses.map((status) => (
                <option key={status} value={status}>
                    {t.processingStatus.fiscal[status]}
                </option>
            ))}
        </SelectFilterField>
    )
}
