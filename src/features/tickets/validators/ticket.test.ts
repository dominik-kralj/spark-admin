// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
    ticketDetailResponseSchema,
    ticketPageResponseSchema,
    ticketResponseSchema,
    toTicket,
    toTicketDetail,
    toTicketListQuery,
    toTicketPage,
    type Ticket,
} from './ticket'

const rawTicket = {
    ticketId: '6f1c2a1e-4b7f-4c3a-8e21-5f0a7b9c3d12',
    ticketType: 'Standard',
    createdAt: '2026-10-06T07:14:00Z',
    vehicleRegistration: 'ZG1234AB',
    zoneId: 1,
    zoneCode: 'ZONA1',
    parkingMinutes: 60,
    amount: 0.7,
    validUntil: '2026-10-06T08:14:00Z',
    paymentStatus: 'DONE',
    fiscalStatus: 'PROCESSING',
}

const ticket: Ticket = {
    id: '6f1c2a1e-4b7f-4c3a-8e21-5f0a7b9c3d12',
    type: 'standard',
    createdAt: new Date('2026-10-06T07:14:00Z'),
    plate: 'ZG1234AB',
    zone: { id: 1, code: 'ZONA1' },
    parkingMinutes: 60,
    amount: 0.7,
    validUntil: new Date('2026-10-06T08:14:00Z'),
    payment: { status: 'done' },
    fiscal: { status: 'processing' },
}

const rawDetail = {
    ...rawTicket,
    transactionId: 412,
    osnovica: 0.56,
    stopaPDV: 25,
    iznosPDV: 0.14,
    jir: '9d6c2a1e-4b7f-4c3a-8e21-5f0a7b9c3d12',
    zki: 'a3f1c9e07b2d4856b9e4d1c07f3a6e25',
    fiscalizedAt: '2026-10-06T07:14:05Z',
    fiscalLastError: null,
}

function without(raw: Record<string, unknown>, ...keys: string[]) {
    return Object.fromEntries(Object.entries(raw).filter(([key]) => !keys.includes(key)))
}

function parseTicket(raw: unknown): Ticket {
    return toTicket(ticketResponseSchema.parse(raw))
}

describe('ticket mapping', () => {
    it('maps a raw ticket to the domain, with payment and fiscal sub-objects', () => {
        expect(parseTicket(rawTicket)).toEqual(ticket)
    })

    it('maps each spec status value to its domain status', () => {
        const statuses = ['PENDING', 'PROCESSING', 'DONE', 'FAIL'].map(
            (status) => parseTicket({ ...rawTicket, fiscalStatus: status }).fiscal.status,
        )

        expect(statuses).toEqual(['pending', 'processing', 'done', 'failed'])
    })

    it('rejects a status outside the spec set', () => {
        expect(
            ticketResponseSchema.safeParse({ ...rawTicket, paymentStatus: 'AUTHORIZED' }).success,
        ).toBe(false)
        expect(ticketResponseSchema.safeParse({ ...rawTicket, fiscalStatus: 'done' }).success).toBe(
            false,
        )
    })

    it('reads the payment status from the Viva* column name the spec also uses', () => {
        const withVivaName = { ...without(rawTicket, 'paymentStatus'), vivaStatus: 'DONE' }

        expect(parseTicket(withVivaName)).toEqual(ticket)
    })

    it('prefers paymentStatus when both names arrive', () => {
        expect(parseTicket({ ...rawTicket, vivaStatus: 'FAIL' }).payment.status).toBe('done')
    })

    it('rejects a ticket with neither payment status name', () => {
        expect(ticketResponseSchema.safeParse(without(rawTicket, 'paymentStatus')).success).toBe(
            false,
        )
    })

    it('computes validUntil from createdAt and parkingMinutes when it is missing', () => {
        const withoutValidUntil = without(rawTicket, 'validUntil')

        expect(parseTicket({ ...withoutValidUntil, parkingMinutes: 90 }).validUntil).toEqual(
            new Date('2026-10-06T08:44:00Z'),
        )
        expect(parseTicket({ ...rawTicket, validUntil: null }).validUntil).toEqual(
            new Date('2026-10-06T08:14:00Z'),
        )
    })

    it('reads dates without an offset as UTC', () => {
        const parsed = parseTicket({ ...rawTicket, createdAt: '2026-10-06T07:14:00' })

        expect(parsed.createdAt).toEqual(new Date('2026-10-06T07:14:00Z'))
    })

    it('maps the ticket type, Standard by default as in the table', () => {
        expect(parseTicket(without(rawTicket, 'ticketType')).type).toBe('standard')
        expect(parseTicket({ ...rawTicket, ticketType: 'Dnevna' }).type).toBe('daily')
    })

    it('keeps the amount at full precision', () => {
        expect(parseTicket({ ...rawTicket, amount: 0.705123 }).amount).toBe(0.705123)
    })
})

describe('ticket detail mapping', () => {
    it('adds the transaction, VAT and fiscalization fields', () => {
        expect(toTicketDetail(ticketDetailResponseSchema.parse(rawDetail))).toEqual({
            ...ticket,
            transactionId: '412',
            vat: { base: 0.56, rate: 25, amount: 0.14 },
            fiscal: {
                status: 'processing',
                jir: '9d6c2a1e-4b7f-4c3a-8e21-5f0a7b9c3d12',
                zki: 'a3f1c9e07b2d4856b9e4d1c07f3a6e25',
                fiscalizedAt: new Date('2026-10-06T07:14:05Z'),
                lastError: null,
            },
        })
    })

    it('keeps VAT at full precision', () => {
        const detail = toTicketDetail(
            ticketDetailResponseSchema.parse({ ...rawDetail, osnovica: 0.564, iznosPDV: 0.141 }),
        )

        expect(detail.vat).toEqual({ base: 0.564, rate: 25, amount: 0.141 })
    })

    it('accepts a transaction id sent as a string', () => {
        const detail = toTicketDetail(
            ticketDetailResponseSchema.parse({ ...rawDetail, transactionId: '20261006-000412' }),
        )

        expect(detail.transactionId).toBe('20261006-000412')
    })

    it('treats missing fiscal values as null', () => {
        const bare = without(rawDetail, 'jir', 'zki', 'fiscalizedAt', 'fiscalLastError')
        const detail = toTicketDetail(ticketDetailResponseSchema.parse(bare))

        expect(detail.fiscal).toEqual({
            status: 'processing',
            jir: null,
            zki: null,
            fiscalizedAt: null,
            lastError: null,
        })
    })
})

describe('ticket page mapping', () => {
    it('maps the items and keeps the paging numbers', () => {
        const page = toTicketPage(
            ticketPageResponseSchema.parse({
                items: [rawTicket],
                page: 2,
                pageSize: 25,
                totalCount: 26,
            }),
        )

        expect(page).toEqual({ items: [ticket], page: 2, pageSize: 25, totalCount: 26 })
    })
})

describe('toTicketListQuery', () => {
    it('sends paging and the sort with raw names', () => {
        expect(
            toTicketListQuery({
                page: 3,
                pageSize: 25,
                sort: { key: 'plate', direction: 'asc' },
                filters: {},
            }),
        ).toEqual({ page: 3, pageSize: 25, sortBy: 'vehicleRegistration', sortDir: 'asc' })
    })

    it('sends every filter, dates as UTC instants and the status as the spec value', () => {
        expect(
            toTicketListQuery({
                page: 1,
                pageSize: 25,
                sort: { key: 'createdAt', direction: 'desc' },
                filters: {
                    plate: 'ZG12',
                    createdFrom: new Date('2026-10-05T22:00:00Z'),
                    createdTo: new Date('2026-10-06T22:00:00Z'),
                    zoneId: 2,
                    fiscalStatus: 'failed',
                },
            }),
        ).toEqual({
            page: 1,
            pageSize: 25,
            sortBy: 'createdAt',
            sortDir: 'desc',
            plate: 'ZG12',
            createdFrom: '2026-10-05T22:00:00.000Z',
            createdTo: '2026-10-06T22:00:00.000Z',
            zoneId: 2,
            fiscalStatus: 'FAIL',
        })
    })
})
