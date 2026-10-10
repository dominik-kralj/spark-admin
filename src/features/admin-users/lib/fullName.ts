import type { AdminUser } from '../validators/adminUser'

export function fullName(user: Pick<AdminUser, 'name' | 'surname'>): string {
    return `${user.name} ${user.surname}`
}
