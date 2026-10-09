import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { mockDailyTicketIds } from '@/mocks/dailyTickets'
import type { TicketFilters } from '@/shared/lib/ticketFilterValues'
import { renderHookWithQueryClient } from '@/test/render'
import { signInForTest } from '@/test/session'

import type { DailyTicketListParams, DailyTicketPage } from '../validators/dailyTicket'

import { useDailyTicket, useDailyTickets, useFiscalizeDailyTicket } from './useDailyTickets'

const seedCount = 60

const firstPage: DailyTicketListParams = {
    page: 1,
    pageSize: 25,
    sort: { key: 'createdAt', direction: 'desc' },
    filters: {},
}

async function loadPage(params: DailyTicketListParams): Promise<DailyTicketPage> {
    signInForTest()
    const { result } = renderHookWithQueryClient(() => useDailyTickets(params))

    await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
    })
    if (result.current.data === undefined) throw new Error('Expected a page of daily tickets')

    return result.current.data
}

async function loadFiltered(filters: TicketFilters): Promise<DailyTicketPage> {
    return loadPage({ ...firstPage, pageSize: 100, filters })
}

async function loadDetail(id: string) {
    signInForTest()
    const { result } = renderHookWithQueryClient(() => useDailyTicket(id))

    await waitFor(() => {
        expect(result.current.isPending).toBe(false)
    })

    return result.current
}

/** The first page and the fiscalize mutation, on one query client. */
function renderListAndFiscalize() {
    signInForTest()

    return renderHookWithQueryClient(() => ({
        list: useDailyTickets({ ...firstPage, pageSize: 100 }),
        fiscalize: useFiscalizeDailyTicket(),
    })).result
}

function listStatus(page: DailyTicketPage | undefined, id: string) {
    return page?.items.find((item) => item.id === id)?.fiscal.status
}

describe('useDailyTickets', () => {
    it("loads the first page of the city's daily tickets, newest first", async () => {
        const page = await loadPage(firstPage)

        expect(page).toMatchObject({ page: 1, pageSize: 25, totalCount: seedCount })
        expect(page.items.slice(0, 3).map((ticket) => ticket.plate)).toEqual([
            'ZG5553AI',
            'ZG9087KL',
            'KA4410CD',
        ])
        expect(page.items[0]).toEqual({
            id: mockDailyTicketIds.newest,
            createdAt: new Date('2026-10-06T07:05:00Z'),
            plate: 'ZG5553AI',
            zone: { id: 1, code: 'ZONA1' },
            address: 'Trg kralja Tomislava 5',
            inspector: { id: 1, name: 'Marko Horvat' },
            amount: 15,
            fiscal: { status: 'done' },
        })
    })

    it('sorts by inspector surname on the server', async () => {
        const page = await loadPage({
            ...firstPage,
            pageSize: 100,
            sort: { key: 'inspector', direction: 'asc' },
        })
        const names = page.items.map((ticket) => ticket.inspector.name)

        expect(names[0]).toBe('Marko Horvat')
        expect(names.at(-1)).toBe('Davor Šimić')
    })

    it('filters by fiscal status, zone and date range', async () => {
        const failed = await loadFiltered({ fiscalStatus: 'failed' })
        const sixthInZone2 = await loadFiltered({
            zoneId: 2,
            createdFrom: new Date('2026-10-05T22:00:00Z'),
            createdTo: new Date('2026-10-06T22:00:00Z'),
        })

        expect(failed.items.map((ticket) => ticket.plate)).toEqual(
            expect.arrayContaining(['ZG9087KL', 'ZG6140TR']),
        )
        expect(failed.items.every((ticket) => ticket.fiscal.status === 'failed')).toBe(true)
        expect(sixthInZone2.items.map((ticket) => ticket.plate)).toEqual(['ZG9087KL'])
    })
})

describe('useDailyTicket', () => {
    it('loads the detail with its fiscal fields and photos', async () => {
        const detail = await loadDetail(mockDailyTicketIds.failed)

        expect(detail.data).toMatchObject({
            plate: 'ZG9087KL',
            fiscal: {
                status: 'failed',
                jir: null,
                lastError: expect.stringMatching(/Porezna/) as string,
            },
        })
        expect(detail.data?.photos).toHaveLength(3)
        expect(detail.data?.photos[0]?.url).toMatch(/^data:image\/svg\+xml,/)
    })

    it("answers another city's daily ticket with not found", async () => {
        const detail = await loadDetail(mockDailyTicketIds.otherCity)

        expect(detail.error).toMatchObject({ kind: 'notFound', status: 404 })
    })
})

describe('useFiscalizeDailyTicket', () => {
    it('fiscalizes a failed daily ticket and updates the list row in the cache', async () => {
        const result = renderListAndFiscalize()
        await waitFor(() => {
            expect(listStatus(result.current.list.data, mockDailyTicketIds.failed)).toBe('failed')
        })

        let detail: Awaited<ReturnType<typeof result.current.fiscalize.mutateAsync>> | undefined
        await act(async () => {
            detail = await result.current.fiscalize.mutateAsync(mockDailyTicketIds.failed)
        })

        expect(detail?.fiscal).toMatchObject({ status: 'done', lastError: null })
        expect(detail?.fiscal.jir).toMatch(/^[\da-f-]{36}$/)
        await waitFor(() => {
            expect(listStatus(result.current.list.data, mockDailyTicketIds.failed)).toBe('done')
        })
    })

    it('keeps a ticket failed when the tax authority fails again', async () => {
        const result = renderListAndFiscalize()

        let detail: Awaited<ReturnType<typeof result.current.fiscalize.mutateAsync>> | undefined
        await act(async () => {
            detail = await result.current.fiscalize.mutateAsync(mockDailyTicketIds.failsAgain)
        })

        expect(detail?.fiscal).toMatchObject({
            status: 'failed',
            lastError: expect.stringMatching(/Porezna/) as string,
        })
    })

    it.each([
        ['fiscalized', mockDailyTicketIds.newest, 'alreadyFiscalized'],
        ['in progress', mockDailyTicketIds.processing, 'fiscalizationInProgress'],
    ])('is refused for a daily ticket that is %s', async (_state, id, code) => {
        const result = renderListAndFiscalize()

        await act(async () => {
            await expect(result.current.fiscalize.mutateAsync(id)).rejects.toMatchObject({
                kind: 'conflict',
                body: { code },
            })
        })
    })
})
