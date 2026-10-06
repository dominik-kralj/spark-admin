import { z } from 'zod'

import { hr } from '@/shared/i18n/hr'

export const loginFormSchema = z.object({
    username: z.string().trim().min(1, hr.login.usernameRequired),
    password: z.string().min(1, hr.login.passwordRequired),
})

export type LoginFormValues = z.input<typeof loginFormSchema>

export const emptyLoginForm: LoginFormValues = { username: '', password: '' }
