import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { fieldMessage } from '@/shared/lib/fieldMessage'

import type { InspectorField } from '../validators/inspector'
import { nameMaxLength } from '../validators/inspectorForm'

interface InspectorFieldMessageArgs {
    field: InspectorField
    error: FieldError | undefined
    t: Dictionary
}

export function inspectorFieldMessage({
    field,
    error,
    t,
}: InspectorFieldMessageArgs): string | undefined {
    return fieldMessage({
        error,
        ruleMessages: { ...t.forms.validation, tooLong: t.inspectors.form.tooLong(nameMaxLength) },
        duplicateMessage: field === 'oib' ? t.inspectors.form.duplicateOib : undefined,
        t,
    })
}
