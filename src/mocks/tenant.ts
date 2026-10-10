import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { validationProblem } from './responses'
import { apiUrl } from './url'

const seedTenant = {
    tenantName: 'Grad Samobor',
    vatID: '12345678903',
    address: 'Trg kralja Tomislava',
    houseNo: '5',
    zipCode: '10430',
    city: 'Samobor',
    iban: 'HR1210010051863000160',
    premisesCode: 'SAMOBOR1',
    cashRegisterCode: '1',
    stopaPDV: 25,
    reportEmail: 'promet@samobor.hr',
}

let mockTenant = { ...seedTenant }

export function resetTenant(): void {
    mockTenant = { ...seedTenant }
}

const text = (maxLength: number) => z.string().trim().min(1).max(maxLength)

// The CITY_TENANTS columns the city may edit; IBAN is not a column yet (api-contract.md D12).
const tenantBodySchema = z.object({
    tenantName: text(100),
    vatID: z.string().regex(/^\d{11}$/),
    address: text(150),
    houseNo: text(20),
    zipCode: text(10),
    city: text(100),
    iban: z.string().regex(/^HR\d{19}$/),
    premisesCode: text(25),
    // CK_CITY_TENANTS_CashRegisterCode
    cashRegisterCode: z.string().regex(/^[1-9]\d{0,14}$/),
    stopaPDV: z
        .number()
        .min(0)
        .max(100)
        .refine((rate) => Math.abs(Math.round(rate * 100) - rate * 100) < 1e-9),
})

export const tenantHandlers = [
    http.get(apiUrl('/tenant'), () => HttpResponse.json(mockTenant)),

    http.put(apiUrl('/tenant'), async ({ request }) => {
        const parsed = tenantBodySchema.safeParse(await request.json())
        if (!parsed.success) return validationProblem(parsed.error)

        mockTenant = { ...mockTenant, ...parsed.data }

        return HttpResponse.json(mockTenant)
    }),
]
