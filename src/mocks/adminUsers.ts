// Seed data only, with no imports, so the e2e suite can read it under plain Node.

/** The one account the mock accepts. */
export const mockAdminCredentials = { username: 'admin', password: 'spark2026' }

export const mockAdminUser = {
    adminUserId: 1,
    tenantId: 1,
    username: mockAdminCredentials.username,
    name: 'Ana',
    surname: 'Kovač',
}
