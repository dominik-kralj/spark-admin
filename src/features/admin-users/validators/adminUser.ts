import { z } from 'zod'

import { fieldErrorsFrom, type ServerFieldError } from '@/shared/api'

// No password: Zod drops unknown keys, so one sent by mistake never reaches the app.
export const adminUserResponseSchema = z.object({
    adminUserId: z.number(),
    username: z.string(),
    name: z.string(),
    surname: z.string(),
})

export const adminUserListResponseSchema = z.array(adminUserResponseSchema)

type AdminUserResponse = z.output<typeof adminUserResponseSchema>

type AdminUserCreateRequest = Omit<AdminUserResponse, 'adminUserId'> & { password: string }

type AdminUserUpdateRequest = Pick<AdminUserCreateRequest, 'name' | 'surname'> & {
    password?: string
}

export interface AdminUser {
    id: number
    username: string
    name: string
    surname: string
}

export type AdminUserCreateInput = Omit<AdminUser, 'id'> & { password: string }

export type AdminUserUpdateInput = Pick<AdminUser, 'name' | 'surname'> & {
    /** Null keeps the current password. */
    password: string | null
}

export type AdminUserField = keyof AdminUserCreateInput

export function toAdminUser(raw: AdminUserResponse): AdminUser {
    return {
        id: raw.adminUserId,
        username: raw.username,
        name: raw.name,
        surname: raw.surname,
    }
}

export function toAdminUserCreateRequest(input: AdminUserCreateInput): AdminUserCreateRequest {
    return {
        username: input.username,
        name: input.name,
        surname: input.surname,
        password: input.password,
    }
}

export function toAdminUserUpdateRequest(input: AdminUserUpdateInput): AdminUserUpdateRequest {
    return {
        name: input.name,
        surname: input.surname,
        ...(input.password !== null && { password: input.password }),
    }
}

// In form order, so the first error is the first field on screen.
const adminUserFieldForRawName: Record<keyof AdminUserCreateRequest, AdminUserField> = {
    username: 'username',
    name: 'name',
    surname: 'surname',
    password: 'password',
}

export function toAdminUserFieldErrors(
    error: unknown,
): Partial<Record<AdminUserField, ServerFieldError>> {
    return fieldErrorsFrom(error, adminUserFieldForRawName)
}
