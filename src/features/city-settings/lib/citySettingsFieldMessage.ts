import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { fieldMessage } from '@/shared/lib/fieldMessage'

import type { CitySettingsField } from '../validators/citySettings'
import { textMaxLength } from '../validators/citySettingsForm'

interface CitySettingsFieldMessageArgs {
    field: CitySettingsField
    error: FieldError | undefined
    t: Dictionary
}

export function citySettingsFieldMessage({
    field,
    error,
    t,
}: CitySettingsFieldMessageArgs): string | undefined {
    const maxLengths: Partial<Record<CitySettingsField, number>> = textMaxLength
    const maxLength = maxLengths[field]
    const tooLong = maxLength === undefined ? undefined : t.forms.tooLong(maxLength)

    return fieldMessage({
        error,
        ruleMessages: { ...t.forms.validation, ...t.citySettings.validation, tooLong },
        t,
    })
}
