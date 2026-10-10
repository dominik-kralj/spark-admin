import type { FieldError } from 'react-hook-form'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { fieldMessage } from '@/shared/lib/fieldMessage'

import { textMaxLength, type AdminUserFormField } from '../validators/adminUserForm'

interface AdminUserFieldMessageArgs {
    field: AdminUserFormField
    error: FieldError | undefined
    t: Dictionary
}

export function adminUserFieldMessage({
    field,
    error,
    t,
}: AdminUserFieldMessageArgs): string | undefined {
    return fieldMessage({
        error,
        ruleMessages: { ...t.forms.validation, tooLong: t.forms.tooLong(textMaxLength) },
        duplicateMessage: field === 'username' ? t.adminUsers.form.duplicateUsername : undefined,
        t,
    })
}
