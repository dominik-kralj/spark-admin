import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { fieldMessage } from '@/shared/lib/fieldMessage'

import type { ZoneField } from '../validators/zone'

interface ZoneFieldMessageArgs {
    field: ZoneField
    error: FieldError | undefined
    t: Dictionary
}

export function zoneFieldMessage({ field, error, t }: ZoneFieldMessageArgs): string | undefined {
    const duplicateMessages: Partial<Record<ZoneField, string>> = t.zones.form.duplicate

    return fieldMessage({
        error,
        ruleMessages: t.zones.form.errors,
        duplicateMessage: duplicateMessages[field],
        t,
    })
}
