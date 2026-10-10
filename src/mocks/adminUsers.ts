import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminCredentials, mockAdminUser } from './adminAccount'
import { duplicate, notFound, validationProblem } from './responses'
import { apiUrl } from './url'

interface AdminUserRow {
    adminUserId: number
    tenantId: number
    username: string
    name: string
    surname: string
    password: string
}

// The signed-in admin and the design's other two rows.
const seedAdminUsers: AdminUserRow[] = [
    { ...mockAdminUser, password: mockAdminCredentials.password },
    {
        adminUserId: 2,
        tenantId: 1,
        username: 'marin.loncar',
        name: 'Marin',
        surname: 'Lončar',
        password: 'marin2026',
    },
    {
        adminUserId: 3,
        tenantId: 1,
        username: 'sanja.klaric',
        name: 'Sanja',
        surname: 'Klarić',
        password: 'sanja2026',
    },
    // Another city's user: hidden from the list, 404 by id, and its username stays free here.
    {
        adminUserId: 4,
        tenantId: 2,
        username: 'ivan.maric',
        name: 'Ivan',
        surname: 'Marić',
        password: 'ivan2026',
    },
]

let adminUsers: AdminUserRow[] = []

export function resetAdminUsers(): void {
    adminUsers = seedAdminUsers.map((user) => ({ ...user }))
}

resetAdminUsers()

const text = z.string().trim().min(1).max(100)

const createBodySchema = z.object({
    username: text,
    name: text,
    surname: text,
    password: z.string().min(1),
})

// Left out, the password stays as it is.
const updateBodySchema = z.object({
    name: text,
    surname: text,
    password: z.string().min(1).optional(),
})

const tenantId = mockAdminUser.tenantId

// Every answer goes through here, so a password never leaves the mock.
function toResponse(row: AdminUserRow) {
    return {
        adminUserId: row.adminUserId,
        username: row.username,
        name: row.name,
        surname: row.surname,
    }
}

function findAdminUser(adminUserId: number): AdminUserRow | undefined {
    return adminUsers.find((user) => user.adminUserId === adminUserId && user.tenantId === tenantId)
}

function isUsernameTaken(username: string): boolean {
    return adminUsers.some((user) => user.tenantId === tenantId && user.username === username)
}

export const adminUserHandlers = [
    http.get(apiUrl('/users'), () =>
        HttpResponse.json(adminUsers.filter((user) => user.tenantId === tenantId).map(toResponse)),
    ),

    http.post(apiUrl('/users'), async ({ request }) => {
        const parsed = createBodySchema.safeParse(await request.json())
        if (!parsed.success) return validationProblem(parsed.error)

        if (isUsernameTaken(parsed.data.username)) {
            return duplicate('username')
        }

        const user = {
            adminUserId: Math.max(...adminUsers.map((row) => row.adminUserId)) + 1,
            tenantId,
            ...parsed.data,
        }
        adminUsers.push(user)

        return HttpResponse.json(toResponse(user), { status: 201 })
    }),

    http.put(apiUrl('/users/:adminUserId'), async ({ request, params }) => {
        const existing = findAdminUser(Number(params.adminUserId))
        if (existing === undefined) return notFound()

        const parsed = updateBodySchema.safeParse(await request.json())
        if (!parsed.success) return validationProblem(parsed.error)

        const { password, ...names } = parsed.data
        Object.assign(existing, names)
        if (password !== undefined) existing.password = password

        return HttpResponse.json(toResponse(existing))
    }),

    http.delete(apiUrl('/users/:adminUserId'), ({ params }) => {
        const existing = findAdminUser(Number(params.adminUserId))
        if (existing === undefined) return notFound()
        if (existing.adminUserId === mockAdminUser.adminUserId) {
            return HttpResponse.json({ status: 409, code: 'cannotDeleteSelf' }, { status: 409 })
        }

        adminUsers = adminUsers.filter((user) => user !== existing)

        return new HttpResponse(null, { status: 204 })
    }),
]
