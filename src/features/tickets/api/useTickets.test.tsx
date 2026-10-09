import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { mockTicketIds } from '@/mocks/tickets'
import { renderHookWithQueryClient } from '@/test/render'
import { signInForTest } from '@/test/session'

import {
    useNewestTicketTime,
    useNewTicketCount,
    useTicket,
    useTicketZoneOptions,
    useTickets,
} from './useTickets'
import type { TicketFilters, TicketListParams, TicketPage } from '../validators/ticket'

const seedCount = 300

const firstPage: TicketListParams = {
    page: 1,
    pageSize: 25,
    sort: { key: 'createdAt', direction: 'desc' },
    filters: {},
}

// The design's newest ticket: 06.10.2026 09:14 in Zagreb.
const newestCreatedAt = new Date('2026-10-06T07:14:00Z')

async function loadPage(params: TicketListParams): Promise<TicketPage> {
    signInForTest()
    const { result } = renderHookWithQueryClient(() => useTickets(params))

    await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
    })
    if (result.current.data === undefined) throw new Error('Expected a page of tickets')

    return result.current.data
}

async function loadFiltered(filters: TicketFilters): Promise<TicketPage> {
    return loadPage({ ...firstPage, pageSize: 100, filters })
}

describe('useTickets', () => {
    it("loads the first page of the city's tickets, newest first", async () => {
        const page = await loadPage(firstPage)

        expect(page).toMatchObject({ page: 1, pageSize: 25, totalCount: seedCount })
        expect(page.items).toHaveLength(25)
        expect(page.items.slice(0, 3).map((ticket) => ticket.plate)).toEqual([
            'ZG1234AB',
            'ZG5553AI',
            'ZG9087KL',
        ])
        expect(page.items[0]).toMatchObject({
            id: mockTicketIds.newest,
            createdAt: newestCreatedAt,
            zone: { id: 1, code: 'ZONA1' },
            amount: 0.7,
            payment: { status: 'done' },
            fiscal: { status: 'done' },
        })
    })

    it('loads a later page and an empty page past the end', async () => {
        const last = await loadPage({ ...firstPage, page: 12 })
        const pastEnd = await loadPage({ ...firstPage, page: 13 })

        expect(last.items).toHaveLength(25)
        expect(last.items[0]?.id).not.toBe(mockTicketIds.newest)
        expect(pastEnd).toMatchObject({ items: [], page: 13, totalCount: seedCount })
    })

    it('reports a page size the API does not allow', async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() =>
            useTickets({ ...firstPage, pageSize: 101 }),
        )

        await waitFor(() => {
            expect(result.current.error).toMatchObject({ kind: 'validation', status: 400 })
        })
    })

    it('sorts by plate on the server', async () => {
        const page = await loadPage({ ...firstPage, sort: { key: 'plate', direction: 'asc' } })
        const plates = page.items.map((ticket) => ticket.plate)

        expect(plates).toEqual(plates.toSorted())
        expect(page.totalCount).toBe(seedCount)
    })

    it('sorts by amount, highest first', async () => {
        const page = await loadPage({ ...firstPage, sort: { key: 'amount', direction: 'desc' } })
        const amounts = page.items.map((ticket) => ticket.amount)

        expect(amounts).toEqual(amounts.toSorted((a, b) => b - a))
    })

    it('filters by part of the plate, in any case', async () => {
        const page = await loadFiltered({ plate: 'zg12' })

        expect(page.items.map((ticket) => ticket.plate)).toContain('ZG1234AB')
        expect(page.items.every((ticket) => ticket.plate.includes('ZG12'))).toBe(true)
        expect(page.totalCount).toBe(page.items.length)
    })

    it('filters by a date range that includes its start and excludes its end', async () => {
        const fromNewest = await loadFiltered({ createdFrom: newestCreatedAt })
        const beforeNewest = await loadFiltered({
            createdFrom: new Date('2026-10-06T06:40:00Z'),
            createdTo: newestCreatedAt,
        })

        expect(fromNewest.items.map((ticket) => ticket.plate)).toEqual(['ZG1234AB'])
        expect(beforeNewest.items.map((ticket) => ticket.plate)).toEqual([
            'ZG5553AI',
            'ZG9087KL',
            'KA4410CD',
            'ZG2271MN',
            'ST8032PV',
            'ZG6140TR',
            'ZG3358EH',
        ])
    })

    it('filters by zone', async () => {
        const page = await loadFiltered({ zoneId: 2 })

        expect(page.totalCount).toBeGreaterThan(0)
        expect(page.items.every((ticket) => ticket.zone.code === '2A')).toBe(true)
    })

    it('filters by fiscalization status', async () => {
        const page = await loadFiltered({ fiscalStatus: 'failed' })

        expect(page.items.map((ticket) => ticket.plate)).toContain('KA4410CD')
        expect(page.items.every((ticket) => ticket.fiscal.status === 'failed')).toBe(true)
    })
})

describe('useTicket', () => {
    it('loads one ticket with its transaction, VAT and fiscalization', async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() => useTicket(mockTicketIds.newest))

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
        expect(result.current.data).toMatchObject({
            plate: 'ZG1234AB',
            transactionId: '100300',
            vat: { base: 0.56, rate: 25, amount: 0.14 },
            fiscal: {
                status: 'done',
                jir: expect.any(String) as string,
                zki: expect.any(String) as string,
                fiscalizedAt: new Date('2026-10-06T07:14:05Z'),
                lastError: null,
            },
        })
    })

    it('carries the fiscal error of a failed ticket', async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() => useTicket(mockTicketIds.fiscalFailed))

        await waitFor(() => {
            expect(result.current.data?.fiscal).toMatchObject({
                status: 'failed',
                jir: null,
                lastError: expect.any(String) as string,
            })
        })
    })

    it.each([
        ['does not exist', '00000000-0000-4000-8000-000000000000'],
        ['belongs to another city', mockTicketIds.otherCity],
    ])('answers 404 for a ticket that %s', async (_case, id) => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() => useTicket(id))

        await waitFor(() => {
            expect(result.current.error).toMatchObject({ kind: 'notFound', status: 404 })
        })
    })
})

describe('useNewTicketCount', () => {
    it('counts the tickets created after a given one', async () => {
        signInForTest()
        // ZG9087KL, 09:07 in Zagreb; ZG5553AI and ZG1234AB came after it.
        const { result } = renderHookWithQueryClient(() =>
            useNewTicketCount({ createdAfter: new Date('2026-10-06T07:07:00Z'), filters: {} }),
        )

        await waitFor(() => {
            expect(result.current.data).toBe(2)
        })
    })

    it('counts only new tickets that match the filters', async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() =>
            useNewTicketCount({
                createdAfter: new Date('2026-10-06T07:07:00Z'),
                filters: { zoneId: 1 },
            }),
        )

        await waitFor(() => {
            expect(result.current.data).toBe(1)
        })
    })

    it('stays idle until there is a ticket to count from', () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() =>
            useNewTicketCount({ createdAfter: null, filters: {} }),
        )

        expect(result.current.fetchStatus).toBe('idle')
    })
})

describe('useNewestTicketTime', () => {
    it('finds the newest ticket that matches the filters', async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() => useNewestTicketTime({ zoneId: 2 }))

        // ZG5553AI, 09:11 in Zagreb, is the newest in 2A.
        await waitFor(() => {
            expect(result.current.data).toEqual(new Date('2026-10-06T07:11:00Z'))
        })
    })

    it('counts from the start of time when no ticket matches', async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() =>
            useNewestTicketTime({ plate: 'NOSUCHPLATE' }),
        )

        await waitFor(() => {
            expect(result.current.data).toEqual(new Date(0))
        })
    })

    it('counts from the start of the range when no ticket in a future range matches', async () => {
        signInForTest()
        const createdFrom = new Date('2099-01-01T00:00:00Z')
        const { result } = renderHookWithQueryClient(() => useNewestTicketTime({ createdFrom }))

        await waitFor(() => {
            expect(result.current.data).toEqual(new Date('2098-12-31T23:59:59.999Z'))
        })
    })
})

describe('useTicketZoneOptions', () => {
    it("lists the city's zones by code", async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() => useTicketZoneOptions())

        await waitFor(() => {
            expect(result.current.data).toEqual([
                { id: 2, code: '2A' },
                { id: 1, code: 'ZONA1' },
            ])
        })
    })
})
