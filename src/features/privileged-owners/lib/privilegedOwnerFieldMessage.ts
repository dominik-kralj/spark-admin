import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { fieldMessage } from '@/shared/lib/fieldMessage'

import type { PrivilegedOwnerField } from '../validators/privilegedOwner'
import { textMaxLength } from '../validators/privilegedOwnerForm'

interface PrivilegedOwnerFieldMessageArgs {
    field: PrivilegedOwnerField
    error: FieldError | undefined
    t: Dictionary
}

export function privilegedOwnerFieldMessage({
    field,
    error,
    t,
}: PrivilegedOwnerFieldMessageArgs): string | undefined {
    const maxLengths: Partial<Record<PrivilegedOwnerField, number>> = textMaxLength
    const maxLength = maxLengths[field]
    const tooLong = maxLength === undefined ? undefined : t.privilegedOwners.form.tooLong(maxLength)

    return fieldMessage({ error, ruleMessages: { ...t.forms.validation, tooLong }, t })
}
