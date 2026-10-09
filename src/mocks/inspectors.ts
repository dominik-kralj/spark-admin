import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminUser } from './adminUsers'
import { notFound, validationProblem } from './responses'
import { apiUrl } from './url'

interface InspectorRow {
    inspectorId: number
    tenantId: number
    oib: string
    name: string
    surname: string
    pin: string
    isActive: boolean
    /** Daily tickets this inspector issued (TICKETS.InspectorId). */
    ticketCount: number
}

// The design's rows.
const seedInspectors: InspectorRow[] = [
    {
        inspectorId: 1,
        tenantId: 1,
        oib: '12345678901',
        name: 'Marko',
        surname: 'Horvat',
        pin: '1234',
        isActive: true,
        ticketCount: 42,
    },
    {
        inspectorId: 2,
        tenantId: 1,
        oib: '23456789012',
        name: 'Petra',
        surname: 'Novak',
        pin: '2580',
        isActive: true,
        ticketCount: 0,
    },
    {
        inspectorId: 3,
        tenantId: 1,
        oib: '34567890123',
        name: 'Davor',
        surname: 'Šimić',
        pin: '1111',
        isActive: false,
        ticketCount: 7,
    },
    // Another city's inspector: hidden from the list, 404 by id, and its OIB stays free here.
    {
        inspectorId: 4,
        tenantId: 2,
        oib: '45678901234',
        name: 'Ivan',
        surname: 'Marić',
        pin: '9999',
        isActive: true,
        ticketCount: 3,
    },
]

let inspectors: InspectorRow[] = []

export function resetInspectors(): void {
    inspectors = seedInspectors.map((inspector) => ({ ...inspector }))
}

resetInspectors()

const text = z.string().trim().min(1).max(100)

const inspectorBodySchema = z.object({
    name: text,
    surname: text,
    oib: z.string().regex(/^\d{11}$/),
    pin: z.string().regex(/^\d{1,4}$/),
    isActive: z.boolean(),
})

type InspectorBody = z.output<typeof inspectorBodySchema>

const tenantId = mockAdminUser.tenantId

// A list entry and a saved inspector leave the PIN out; only the detail carries it.
function toResponse(row: InspectorRow) {
    return {
        inspectorId: row.inspectorId,
        name: row.name,
        surname: row.surname,
        oib: row.oib,
        isActive: row.isActive,
        ticketCount: row.ticketCount,
    }
}

function findInspector(inspectorId: number): InspectorRow | undefined {
    return inspectors.find(
        (inspector) => inspector.inspectorId === inspectorId && inspector.tenantId === tenantId,
    )
}

// UQ_INSPECTORS_Tenant_Oib. The spec has no unique PIN, so PINs are not checked.
function hasDuplicateOib(body: InspectorBody, ownId: number | null): boolean {
    return inspectors.some(
        (inspector) =>
            inspector.tenantId === tenantId &&
            inspector.inspectorId !== ownId &&
            inspector.oib === body.oib,
    )
}

type BodyResult = { body: InspectorBody } | { response: Response }

async function readInspectorBody(request: Request, ownId: number | null): Promise<BodyResult> {
    const parsed = inspectorBodySchema.safeParse(await request.json())
    if (!parsed.success) return { response: validationProblem(parsed.error) }

    if (hasDuplicateOib(parsed.data, ownId)) {
        return {
            response: HttpResponse.json(
                { status: 409, code: 'duplicate', field: 'oib' },
                { status: 409 },
            ),
        }
    }

    return { body: parsed.data }
}

export const inspectorHandlers = [
    http.get(apiUrl('/inspectors'), () =>
        HttpResponse.json(
            inspectors.filter((inspector) => inspector.tenantId === tenantId).map(toResponse),
        ),
    ),

    http.get(apiUrl('/inspectors/:inspectorId'), ({ params }) => {
        const existing = findInspector(Number(params.inspectorId))
        if (existing === undefined) return notFound()

        return HttpResponse.json({ ...toResponse(existing), pin: existing.pin })
    }),

    http.post(apiUrl('/inspectors'), async ({ request }) => {
        const result = await readInspectorBody(request, null)
        if ('response' in result) return result.response

        const inspector = {
            inspectorId: Math.max(...inspectors.map((row) => row.inspectorId)) + 1,
            tenantId,
            ...result.body,
            ticketCount: 0,
        }
        inspectors.push(inspector)

        return HttpResponse.json(toResponse(inspector), { status: 201 })
    }),

    http.put(apiUrl('/inspectors/:inspectorId'), async ({ request, params }) => {
        const existing = findInspector(Number(params.inspectorId))
        if (existing === undefined) return notFound()

        const result = await readInspectorBody(request, existing.inspectorId)
        if ('response' in result) return result.response

        Object.assign(existing, result.body)

        return HttpResponse.json(toResponse(existing))
    }),

    // Tickets point at the inspector who issued them, so only one with none can go.
    http.delete(apiUrl('/inspectors/:inspectorId'), ({ params }) => {
        const existing = findInspector(Number(params.inspectorId))
        if (existing === undefined) return notFound()
        if (existing.ticketCount > 0) {
            return HttpResponse.json({ status: 409, code: 'inUse' }, { status: 409 })
        }

        inspectors = inspectors.filter((inspector) => inspector !== existing)

        return new HttpResponse(null, { status: 204 })
    }),
]
