import { z } from 'zod'

import { messageKey, requiredText, type ValidationMessage } from '@/shared/lib/validation'

import type { AdminUser, AdminUserCreateInput, AdminUserUpdateInput } from './adminUser'

export const textMaxLength = 100

const message = messageKey<ValidationMessage>

/** On edit the username is fixed and both password fields may stay empty, which keeps the current one. */
export function adminUserFormSchema({ isAdding }: { isAdding: boolean }) {
    // Sent exactly as typed; the password rules are not defined yet (open-questions.md #49).
    const passwords = z.object({
        password: isAdding ? z.string().min(1, message('required')) : z.string(),
        confirmPassword: isAdding ? z.string().min(1, message('required')) : z.string(),
    })

    return z
        .object({
            username: isAdding ? requiredText(textMaxLength) : z.string(),
            name: requiredText(textMaxLength),
            surname: requiredText(textMaxLength),
            ...passwords.shape,
        })
        .refine((values) => values.confirmPassword === values.password, {
            ...message('passwordMismatch'),
            path: ['confirmPassword'],
            // Checked even while another field is invalid, so the message shows when it is left.
            when: (payload) => passwords.safeParse(payload.value).success,
        })
}

export type AdminUserFormValues = z.input<ReturnType<typeof adminUserFormSchema>>

export type AdminUserFormField = keyof AdminUserFormValues

export type ValidAdminUserFormValues = z.output<ReturnType<typeof adminUserFormSchema>>

export const emptyAdminUserForm: AdminUserFormValues = {
    username: '',
    name: '',
    surname: '',
    password: '',
    confirmPassword: '',
}

export function toAdminUserFormValues(user: AdminUser): AdminUserFormValues {
    return {
        username: user.username,
        name: user.name,
        surname: user.surname,
        password: '',
        confirmPassword: '',
    }
}

export function toAdminUserCreateInput(values: ValidAdminUserFormValues): AdminUserCreateInput {
    return {
        username: values.username,
        name: values.name,
        surname: values.surname,
        password: values.password,
    }
}

export function toAdminUserUpdateInput(values: ValidAdminUserFormValues): AdminUserUpdateInput {
    return {
        name: values.name,
        surname: values.surname,
        password: values.password === '' ? null : values.password,
    }
}
