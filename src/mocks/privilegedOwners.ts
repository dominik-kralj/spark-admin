import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { mockAdminUser } from './adminUsers'
import { notFound, validationProblem } from './responses'
import { apiUrl } from './url'

interface PrivilegedOwnerRow {
    privilegedOwnerId: number
    tenantId: number
    vehicleRegistration: string
    validUntil: string
    ownerName: string
    address: string
    houseNo: string
    zipCode: string
    city: string
}

// The design's rows. ValidUntil is the end of the day in Zagreb, so 30.06.2027 is 21:59:59.999Z.
const seedOwners: PrivilegedOwnerRow[] = [
    {
        privilegedOwnerId: 1,
        tenantId: 1,
        vehicleRegistration: 'ZG5553AI',
        validUntil: '2027-06-30T21:59:59.999Z',
        ownerName: 'Marija Jurić',
        address: 'Livadićeva ulica',
        houseNo: '3',
        zipCode: '10430',
        city: 'Samobor',
    },
    {
        privilegedOwnerId: 2,
        tenantId: 1,
        vehicleRegistration: 'ZG3358EH',
        validUntil: '2027-03-31T21:59:59.999Z',
        ownerName: 'Petar Božić',
        address: 'Trg kralja Tomislava',
        houseNo: '11',
        zipCode: '10430',
        city: 'Samobor',
    },
    {
        privilegedOwnerId: 3,
        tenantId: 1,
        vehicleRegistration: 'ZG1234AB',
        validUntil: '2026-12-31T22:59:59.999Z',
        ownerName: 'Josip Babić',
        address: 'Perkovčeva ulica',
        houseNo: '12',
        zipCode: '10430',
        city: 'Samobor',
    },
    {
        privilegedOwnerId: 4,
        tenantId: 1,
        vehicleRegistration: 'ZG2271MN',
        validUntil: '2026-12-31T22:59:59.999Z',
        ownerName: 'Katarina Vuković',
        address: 'Ulica Ljudevita Gaja',
        houseNo: '8',
        zipCode: '10430',
        city: 'Samobor',
    },
    {
        privilegedOwnerId: 5,
        tenantId: 1,
        vehicleRegistration: 'ZG9087KL',
        validUntil: '2026-09-30T21:59:59.999Z',
        ownerName: 'Tomislav Knežević',
        address: 'Starogradska ulica',
        houseNo: '21',
        zipCode: '10430',
        city: 'Samobor',
    },
    {
        privilegedOwnerId: 6,
        tenantId: 1,
        vehicleRegistration: 'ZG6140TR',
        validUntil: '2026-08-31T21:59:59.999Z',
        ownerName: 'Luka Pavlović',
        address: 'Ulica Milana Langa',
        houseNo: '14',
        zipCode: '10430',
        city: 'Samobor',
    },
    // Another city's entry: hidden from the list and 404 by id.
    {
        privilegedOwnerId: 7,
        tenantId: 2,
        vehicleRegistration: 'ZG0001ZZ',
        validUntil: '2027-12-31T22:59:59.999Z',
        ownerName: 'Ivan Marić',
        address: 'Ilica',
        houseNo: '1',
        zipCode: '10000',
        city: 'Zagreb',
    },
]

let owners: PrivilegedOwnerRow[] = []

export function resetPrivilegedOwners(): void {
    owners = seedOwners.map((owner) => ({ ...owner }))
}

resetPrivilegedOwners()

const text = (maxLength: number) => z.string().trim().min(1).max(maxLength)

// Column lengths from the PRIVILEGED_OWNERS CREATE TABLE; every column is NOT NULL.
const privilegedOwnerBodySchema = z.object({
    vehicleRegistration: z.string().regex(/^[\p{Lu}\d]{1,20}$/u),
    validUntil: z.iso.datetime({ offset: true }),
    ownerName: text(200),
    address: text(150),
    houseNo: text(20),
    zipCode: text(10),
    city: text(100),
})

const tenantId = mockAdminUser.tenantId

function toResponse(row: PrivilegedOwnerRow): Omit<PrivilegedOwnerRow, 'tenantId'> {
    return {
        privilegedOwnerId: row.privilegedOwnerId,
        vehicleRegistration: row.vehicleRegistration,
        validUntil: row.validUntil,
        ownerName: row.ownerName,
        address: row.address,
        houseNo: row.houseNo,
        zipCode: row.zipCode,
        city: row.city,
    }
}

function findOwner(privilegedOwnerId: number): PrivilegedOwnerRow | undefined {
    return owners.find(
        (owner) => owner.privilegedOwnerId === privilegedOwnerId && owner.tenantId === tenantId,
    )
}

export const privilegedOwnerHandlers = [
    http.get(apiUrl('/privileged-owners'), () =>
        HttpResponse.json(owners.filter((owner) => owner.tenantId === tenantId).map(toResponse)),
    ),

    http.post(apiUrl('/privileged-owners'), async ({ request }) => {
        const parsed = privilegedOwnerBodySchema.safeParse(await request.json())
        if (!parsed.success) return validationProblem(parsed.error)

        const owner = {
            privilegedOwnerId: Math.max(...owners.map((row) => row.privilegedOwnerId)) + 1,
            tenantId,
            ...parsed.data,
        }
        owners.push(owner)

        return HttpResponse.json(toResponse(owner), { status: 201 })
    }),

    http.put(apiUrl('/privileged-owners/:privilegedOwnerId'), async ({ request, params }) => {
        const existing = findOwner(Number(params.privilegedOwnerId))
        if (existing === undefined) return notFound()

        const parsed = privilegedOwnerBodySchema.safeParse(await request.json())
        if (!parsed.success) return validationProblem(parsed.error)

        Object.assign(existing, parsed.data)

        return HttpResponse.json(toResponse(existing))
    }),
]
