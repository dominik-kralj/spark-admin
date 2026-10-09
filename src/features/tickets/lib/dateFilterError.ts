import type { Dictionary } from '@/shared/i18n/dictionary'
import { fieldMessage } from '@/shared/lib/fieldMessage'

import type { TicketFilterForm } from './useTicketFilterForm'

export type DateFilterName = 'from' | 'to'

export const dateFilterNames: readonly DateFilterName[] = ['from', 'to']

export function dateFilterError(form: TicketFilterForm, name: DateFilterName, t: Dictionary) {
    return fieldMessage({ error: form.formState.errors[name], ruleMessages: t.forms.validation, t })
}
