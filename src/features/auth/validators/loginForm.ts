import { z } from 'zod'

import type { Dictionary } from '@/shared/i18n/dictionary'

/** Built per render, so its messages follow the active language. */
export function createLoginFormSchema(t: Dictionary) {
    return z.object({
        username: z.string().trim().min(1, t.login.usernameRequired),
        password: z.string().min(1, t.login.passwordRequired),
    })
}

type LoginFormSchema = ReturnType<typeof createLoginFormSchema>

export type LoginFormValues = z.input<LoginFormSchema>

export type Credentials = z.output<LoginFormSchema>

export const emptyLoginForm: LoginFormValues = { username: '', password: '' }
