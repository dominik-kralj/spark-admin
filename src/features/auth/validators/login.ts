import { z } from 'zod'

import type { Session } from './session'

export interface Credentials {
    username: string
    password: string
}

export const loginResponseSchema = z.object({
    token: z.string().min(1),
    user: z.object({
        adminUserId: z.number(),
        tenantId: z.number(),
        username: z.string(),
        name: z.string(),
        surname: z.string(),
    }),
})

export function toSession({ user }: z.output<typeof loginResponseSchema>): Session {
    return {
        user: {
            id: user.adminUserId,
            tenantId: user.tenantId,
            username: user.username,
            firstName: user.name,
            lastName: user.surname,
        },
    }
}
