import { IconButton, Input, InputGroup, NativeSelect } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useWatch } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { processingStatuses } from '@/shared/lib/processingStatus'
import { normalisePlate } from '@/shared/lib/validation'
import { FormField, type FieldControlProps } from '@/shared/ui/FormField'
import { useZoneOptions } from '@/shared/lib/useZoneOptions'
import { RangeDateField } from '@/shared/ui/RangeDateField'
import { ZoneOptions } from '@/shared/ui/ZoneOptions'

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
}

export function DateFilterField({ form, name }: DateFilterFieldProps) {
    const t = useStrings()
    const [from, to] = useWatch({ control: form.control, name: ['from', 'to'] })

    return (
        <RangeDateField
            label={t.ticketFilters[name]}
            end={name}
            value={name === 'from' ? from : to}
            otherValue={name === 'from' ? to : from}
            error={dateFilterError(form, name, t)}
            // The range rule sits on "to", so a new start checks it again.
            registration={form.register(name, { deps: name === 'from' ? ['to'] : [] })}
            onPick={(picked) => {
                form.setValue(name, picked, { shouldDirty: true, shouldValidate: true })
            }}
        />
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
            <ZoneOptions zones={zones.data} allZonesLabel={t.ticketFilters.allZones} />
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
