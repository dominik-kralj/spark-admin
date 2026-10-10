import { z } from 'zod'

import { messageKey, requiredText, type ValidationMessage } from '@/shared/lib/validation'

import type { AdminUser, AdminUserUpdateInput } from './adminUser'

export const textMaxLength = 100

/** On edit the username is fixed and the password may stay empty, which keeps the current one. */
export function adminUserFormSchema({ isAdding }: { isAdding: boolean }) {
    return z.object({
        username: isAdding ? requiredText(textMaxLength) : z.string(),
        name: requiredText(textMaxLength),
        surname: requiredText(textMaxLength),
        // Sent exactly as typed; the password rules are not defined yet (open-questions.md #49).
        password: isAdding
            ? z.string().min(1, messageKey<ValidationMessage>('required'))
            : z.string(),
    })
}

export type AdminUserFormValues = z.input<ReturnType<typeof adminUserFormSchema>>

export type ValidAdminUserFormValues = z.output<ReturnType<typeof adminUserFormSchema>>

export const emptyAdminUserForm: AdminUserFormValues = {
    username: '',
    name: '',
    surname: '',
    password: '',
}

export function toAdminUserFormValues(user: AdminUser): AdminUserFormValues {
    return { username: user.username, name: user.name, surname: user.surname, password: '' }
}

export function toAdminUserUpdateInput(values: ValidAdminUserFormValues): AdminUserUpdateInput {
    return {
        name: values.name,
        surname: values.surname,
        password: values.password === '' ? null : values.password,
    }
}
