import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminUser } from './adminAccount'
import { duplicate, notFound, validationProblem } from './responses'
import { apiUrl } from './url'

interface ZoneRow {
    zoneId: number
    tenantId: number
    zoneCode: string
    zoneName: string
    price: number
    dailyTicketPrice: number
    durationMinutes: number
    maxExtensions: number
    dpkIssueDelayMinutes: number
}

const seedZones: ZoneRow[] = [
    {
        zoneId: 1,
        tenantId: 1,
        zoneCode: 'ZONA1',
        zoneName: 'Prva zona',
        price: 0.7,
        dailyTicketPrice: 15,
        durationMinutes: 60,
        maxExtensions: 2,
        dpkIssueDelayMinutes: 15,
    },
    {
        zoneId: 2,
        tenantId: 1,
        zoneCode: '2A',
        zoneName: 'Druga zona A',
        price: 0.5,
        dailyTicketPrice: 15,
        durationMinutes: 60,
        maxExtensions: 3,
        dpkIssueDelayMinutes: 20,
    },
    // Another city's zone: hidden from the list, 404 by id, and its code and name stay free here.
    {
        zoneId: 3,
        tenantId: 2,
        zoneCode: 'ZONA2',
        zoneName: 'Druga zona',
        price: 1,
        dailyTicketPrice: 20,
        durationMinutes: 60,
        maxExtensions: 3,
        dpkIssueDelayMinutes: 15,
    },
]

let zones: ZoneRow[] = []

export function resetZones(): void {
    zones = seedZones.map((zone) => ({ ...zone }))
}

resetZones()

const amountSchema = z
    .number()
    .min(0)
    .refine((amount) => Math.round(amount * 100) / 100 === amount)

const zoneBodySchema = z.object({
    zoneCode: z.string().trim().min(1).max(20),
    zoneName: z.string().trim().min(1).max(20),
    price: amountSchema,
    dailyTicketPrice: amountSchema,
    durationMinutes: z.int().positive(),
    maxExtensions: z.int().min(0),
    dpkIssueDelayMinutes: z.int().min(0),
})

type ZoneBody = z.output<typeof zoneBodySchema>

const tenantId = mockAdminUser.tenantId

function toResponse(row: ZoneRow): Omit<ZoneRow, 'tenantId'> {
    return {
        zoneId: row.zoneId,
        zoneCode: row.zoneCode,
        zoneName: row.zoneName,
        price: row.price,
        dailyTicketPrice: row.dailyTicketPrice,
        durationMinutes: row.durationMinutes,
        maxExtensions: row.maxExtensions,
        dpkIssueDelayMinutes: row.dpkIssueDelayMinutes,
    }
}

function findZone(zoneId: number): ZoneRow | undefined {
    return zones.find((zone) => zone.zoneId === zoneId && zone.tenantId === tenantId)
}

// SQL Server's default collation compares case-insensitively.
function equalsIgnoringCase(a: string, b: string): boolean {
    return a.toLocaleUpperCase('hr') === b.toLocaleUpperCase('hr')
}

function duplicateField(body: ZoneBody, ownId: number | null): 'zoneCode' | 'zoneName' | null {
    const others = zones.filter((zone) => zone.tenantId === tenantId && zone.zoneId !== ownId)
    if (others.some((zone) => equalsIgnoringCase(zone.zoneCode, body.zoneCode))) return 'zoneCode'
    if (others.some((zone) => equalsIgnoringCase(zone.zoneName, body.zoneName))) return 'zoneName'

    return null
}

type BodyResult = { body: ZoneBody } | { response: Response }

async function readZoneBody(request: Request, ownId: number | null): Promise<BodyResult> {
    const parsed = zoneBodySchema.safeParse(await request.json())
    if (!parsed.success) return { response: validationProblem(parsed.error) }

    const field = duplicateField(parsed.data, ownId)
    if (field !== null) {
        return { response: duplicate(field) }
    }

    return { body: parsed.data }
}

export const zoneHandlers = [
    http.get(apiUrl('/zones'), () =>
        HttpResponse.json(zones.filter((zone) => zone.tenantId === tenantId).map(toResponse)),
    ),

    http.post(apiUrl('/zones'), async ({ request }) => {
        const result = await readZoneBody(request, null)
        if ('response' in result) return result.response

        const zone = {
            zoneId: Math.max(...zones.map((row) => row.zoneId)) + 1,
            tenantId,
            ...result.body,
        }
        zones.push(zone)

        return HttpResponse.json(toResponse(zone), { status: 201 })
    }),

    http.put(apiUrl('/zones/:zoneId'), async ({ request, params }) => {
        const existing = findZone(Number(params.zoneId))
        if (existing === undefined) return notFound()

        const result = await readZoneBody(request, existing.zoneId)
        if ('response' in result) return result.response

        Object.assign(existing, result.body)

        return HttpResponse.json(toResponse(existing))
    }),

    http.delete(apiUrl('/zones/:zoneId'), ({ params }) => {
        const existing = findZone(Number(params.zoneId))
        if (existing === undefined) return notFound()

        zones = zones.filter((zone) => zone !== existing)

        return new HttpResponse(null, { status: 204 })
    }),
]
