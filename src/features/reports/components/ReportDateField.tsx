import { useWatch } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { fieldMessage } from '@/shared/lib/fieldMessage'
import { RangeDateField } from '@/shared/ui/RangeDateField'

import type { ReportForm } from '../validators/reportForm'

interface ReportDateFieldProps {
    form: ReportForm
    name: 'from' | 'to'
}

export function ReportDateField({ form, name }: ReportDateFieldProps) {
    const t = useStrings()
    const [from, to] = useWatch({ control: form.control, name: ['from', 'to'] })

    return (
        <RangeDateField
            label={t.reports.form[name]}
            end={name}
            value={name === 'from' ? from : to}
            otherValue={name === 'from' ? to : from}
            error={fieldMessage({
                error: form.formState.errors[name],
                ruleMessages: t.forms.validation,
                t,
            })}
            // The range rule sits on "to", so a new start checks it again.
            registration={form.register(name, { deps: name === 'from' ? ['to'] : [] })}
            onPick={(picked) => {
                form.setValue(name, picked, { shouldDirty: true, shouldValidate: true })
            }}
        />
    )
}
