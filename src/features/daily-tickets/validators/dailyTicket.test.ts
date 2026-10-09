// @vitest-environment node
import { describe, expect, it } from 'vitest'

import {
    dailyTicketDetailResponseSchema,
    dailyTicketPageResponseSchema,
    toDailyTicketDetail,
    toDailyTicketListQuery,
    toDailyTicketPage,
    type DailyTicket,
} from './dailyTicket'

const rawDailyTicket = {
    ticketId: '0b8f5d2e-7c41-4a9e-9d3a-2f6e1c8b4a70',
    createdAt: '2026-10-06T06:48:00Z',
    vehicleRegistration: 'ZG9087KL',
    zoneId: 2,
    zoneCode: '2A',
    address: 'Perkovčeva ulica 12',
    inspectorId: 1,
    inspectorName: 'Marko',
    inspectorSurname: 'Horvat',
    amount: 15,
    fiscalStatus: 'FAIL',
}

const dailyTicket: DailyTicket = {
    id: '0b8f5d2e-7c41-4a9e-9d3a-2f6e1c8b4a70',
    createdAt: new Date('2026-10-06T06:48:00Z'),
    plate: 'ZG9087KL',
    zone: { id: 2, code: '2A' },
    address: 'Perkovčeva ulica 12',
    inspector: { id: 1, name: 'Marko Horvat' },
    amount: 15,
    fiscal: { status: 'failed' },
}

const rawDetail = {
    ...rawDailyTicket,
    jir: null,
    zki: '5c1e08b7d2f94a6387a0e3b1c9d4f720',
    fiscalizedAt: null,
    fiscalLastError: 's005: Porezna uprava nije odgovorila u zadanom roku (10 s).',
    photos: [
        { photoId: 'p1', url: 'https://photos.example/p1.jpg' },
        { photoId: 'p2', url: 'https://photos.example/p2.jpg' },
    ],
}

function parsePage(items: unknown[]) {
    return toDailyTicketPage(
        dailyTicketPageResponseSchema.parse({ items, page: 1, pageSize: 25, totalCount: 1 }),
    )
}

function parseDetail(raw: unknown) {
    return toDailyTicketDetail(dailyTicketDetailResponseSchema.parse(raw))
}

describe('daily ticket mapping', () => {
    it('maps a list item to the domain, with the inspector as one name', () => {
        expect(parsePage([rawDailyTicket])).toEqual({
            items: [dailyTicket],
            page: 1,
            pageSize: 25,
            totalCount: 1,
        })
    })

    it('keeps a missing address as null', () => {
        expect(parsePage([{ ...rawDailyTicket, address: null }]).items[0]?.address).toBeNull()
        const withoutAddress = Object.fromEntries(
            Object.entries(rawDailyTicket).filter(([key]) => key !== 'address'),
        )

        expect(parsePage([withoutAddress]).items[0]?.address).toBeNull()
    })

    it('rejects a fiscal status outside the spec set', () => {
        expect(
            dailyTicketPageResponseSchema.safeParse({
                items: [{ ...rawDailyTicket, fiscalStatus: 'ERROR' }],
                page: 1,
                pageSize: 25,
                totalCount: 1,
            }).success,
        ).toBe(false)
    })

    it('maps the detail with its fiscal fields and photos', () => {
        expect(parseDetail(rawDetail)).toEqual({
            ...dailyTicket,
            fiscal: {
                status: 'failed',
                jir: null,
                zki: '5c1e08b7d2f94a6387a0e3b1c9d4f720',
                fiscalizedAt: null,
                lastError: 's005: Porezna uprava nije odgovorila u zadanom roku (10 s).',
            },
            photos: [
                { id: 'p1', url: 'https://photos.example/p1.jpg' },
                { id: 'p2', url: 'https://photos.example/p2.jpg' },
            ],
        })
    })

    it('reads missing fiscal fields and photos as none', () => {
        const detail = parseDetail(rawDailyTicket)

        expect(detail.fiscal).toEqual({
            status: 'failed',
            jir: null,
            zki: null,
            fiscalizedAt: null,
            lastError: null,
        })
        expect(detail.photos).toEqual([])
    })
})

describe('toDailyTicketListQuery', () => {
    it('sends paging, the sort with raw names and every filter', () => {
        expect(
            toDailyTicketListQuery({
                page: 2,
                pageSize: 25,
                sort: { key: 'inspector', direction: 'asc' },
                filters: {
                    plate: 'ZG90',
                    createdFrom: new Date('2026-10-04T22:00:00Z'),
                    createdTo: new Date('2026-10-06T22:00:00Z'),
                    zoneId: 2,
                    fiscalStatus: 'failed',
                },
            }),
        ).toEqual({
            page: 2,
            pageSize: 25,
            sortBy: 'inspector',
            sortDir: 'asc',
            plate: 'ZG90',
            createdFrom: '2026-10-04T22:00:00.000Z',
            createdTo: '2026-10-06T22:00:00.000Z',
            zoneId: 2,
            fiscalStatus: 'FAIL',
        })
    })

    it('sends the plate sort as the column name', () => {
        expect(
            toDailyTicketListQuery({
                page: 1,
                pageSize: 25,
                sort: { key: 'plate', direction: 'desc' },
                filters: {},
            }),
        ).toMatchObject({ sortBy: 'vehicleRegistration', sortDir: 'desc' })
    })
})
