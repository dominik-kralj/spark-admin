import { z } from 'zod'

// One rule per field, so the page shows each field's message from the active dictionary.
export const loginFormSchema = z.object({
    username: z.string().trim().min(1),
    password: z.string().min(1),
})

export type LoginFormValues = z.input<typeof loginFormSchema>

export type Credentials = z.output<typeof loginFormSchema>

export const emptyLoginForm: LoginFormValues = { username: '', password: '' }
