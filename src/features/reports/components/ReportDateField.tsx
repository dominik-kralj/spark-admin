import { Input } from '@chakra-ui/react'
import { useWatch } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { fieldMessage } from '@/shared/lib/fieldMessage'
import { readDateText } from '@/shared/lib/validation'
import { DateInput } from '@/shared/ui/DateInput'
import { FormField } from '@/shared/ui/FormField'

import type { ReportForm } from '../validators/reportForm'

interface ReportDateFieldProps {
    form: ReportForm
    name: 'from' | 'to'
}

export function ReportDateField({ form, name }: ReportDateFieldProps) {
    const t = useStrings()
    const label = t.reports.form[name]
    const typedDate = useWatch({ control: form.control, name })
    const otherDate = readDateText(
        useWatch({ control: form.control, name: name === 'from' ? 'to' : 'from' }),
    )
    // The calendar offers only days that keep the range in order.
    const bound = 'date' in otherDate ? otherDate.date : undefined
    const error = fieldMessage({
        error: form.formState.errors[name],
        ruleMessages: t.forms.validation,
        t,
    })

    return (
        <FormField label={label} error={error}>
            {(control) => (
                <DateInput
                    label={label}
                    value={typedDate}
                    min={name === 'to' ? bound : undefined}
                    max={name === 'from' ? bound : undefined}
                    onPick={(picked) => {
                        form.setValue(name, picked, { shouldDirty: true, shouldValidate: true })
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
