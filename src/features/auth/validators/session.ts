import { z } from 'zod'

const adminUserSchema = z.object({
    id: z.number(),
    tenantId: z.number(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
})

export type AdminUser = z.infer<typeof adminUserSchema>

export interface Session {
    user: AdminUser
}

/** A stored user from an older build or a tampered tab counts as signed out. */
export function parseSessionUser(stored: unknown): Session | null {
    const parsed = adminUserSchema.safeParse(stored)

    return parsed.success ? { user: parsed.data } : null
}
