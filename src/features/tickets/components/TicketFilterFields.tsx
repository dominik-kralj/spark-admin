import { Input, InputGroup, NativeSelect } from '@chakra-ui/react'
import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { fieldMessage } from '@/shared/lib/fieldMessage'
import { processingStatuses } from '@/shared/lib/processingStatus'
import { normalisePlate } from '@/shared/lib/validation'
import { DateInput } from '@/shared/ui/DateInput'
import { FormField, type FieldControlProps } from '@/shared/ui/FormField'

import { useTicketZoneOptions } from '../api/useTickets'
import type { TicketFilterValues } from '../validators/ticketFilterForm'
import type { TicketFilterFormValues } from '../validators/ticketFilterForm'

export type TicketFilterForm = UseFormReturn<TicketFilterFormValues, unknown, TicketFilterValues>

interface FilterFieldProps {
    form: TicketFilterForm
}

export function PlateFilterField({ form }: FilterFieldProps) {
    const t = useStrings()
    const f = t.tickets.filters

    return (
        <FormField label={f.plate}>
            {(control) => (
                <InputGroup startElement={<Search size="16" aria-hidden="true" />}>
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
    name: 'from' | 'to'
}

export function DateFilterField({ form, name }: DateFilterFieldProps) {
    const t = useStrings()
    const label = t.tickets.filters[name]
    const typedDate = useWatch({ control: form.control, name })

    return (
        <FormField
            label={label}
            error={fieldMessage({
                error: form.formState.errors[name],
                ruleMessages: t.forms.validation,
                t,
            })}
        >
            {(control) => (
                <DateInput
                    label={label}
                    value={typedDate}
                    onPick={(picked) => {
                        form.setValue(name, picked, {
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
    const zones = useTicketZoneOptions()

    return (
        <SelectFilterField form={form} name="zoneId" label={t.tickets.filters.zone}>
            <option value="">{t.tickets.filters.allZones}</option>
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
        <SelectFilterField form={form} name="fiscalStatus" label={t.tickets.filters.fiscal}>
            <option value="">{t.tickets.filters.allStatuses}</option>
            {processingStatuses.map((status) => (
                <option key={status} value={status}>
                    {t.processingStatus.fiscal[status]}
                </option>
            ))}
        </SelectFilterField>
    )
}
