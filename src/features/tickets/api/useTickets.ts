import {
    keepPreviousData,
    queryOptions,
    skipToken,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

import { request } from '@/shared/api'

import {
    newTicketCountResponseSchema,
    ticketDetailResponseSchema,
    ticketPageResponseSchema,
    toNewTicketCountQuery,
    toTicketDetail,
    toTicketListQuery,
    toTicketPage,
    type TicketFilters,
    type TicketListParams,
} from '../validators/ticket'
import { toZoneOptions, zoneOptionsResponseSchema } from '../validators/zoneOption'

interface NewTicketCountParams {
    /** The newest loaded ticket's time; null while nothing is loaded. */
    createdAfter: Date | null
    filters: TicketFilters
}

const ticketKeys = {
    lists: ['tickets', 'list'] as const,
    list: (params: TicketListParams) => ['tickets', 'list', params] as const,
    newestTimes: ['tickets', 'newest'] as const,
    newestTime: (filters: TicketFilters) => ['tickets', 'newest', filters] as const,
    zoneOptions: ['tickets', 'zoneOptions'] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
    newCount: ({ createdAfter, filters }: NewTicketCountParams) =>
        ['tickets', 'newCount', createdAfter, filters] as const,
}

export const newTicketPollMs = 30_000

async function fetchTicketPage(params: TicketListParams, signal: AbortSignal) {
    return toTicketPage(
        await request('/tickets', {
            query: toTicketListQuery(params),
            schema: ticketPageResponseSchema,
            signal,
        }),
    )
}

// Never stale: the rows stay as loaded until the user asks for new ones (useShowNewTickets).
function ticketsQuery(params: TicketListParams) {
    return queryOptions({
        queryKey: ticketKeys.list(params),
        queryFn: ({ signal }) => fetchTicketPage(params, signal),
        staleTime: Infinity,
    })
}

// What the list's rows are as new as; kept with the rows, so the two only move together.
function newestTicketTimeQuery(filters: TicketFilters) {
    return queryOptions({
        queryKey: ticketKeys.newestTime(filters),
        queryFn: async ({ signal }) => {
            const { items } = await fetchTicketPage(
                { page: 1, pageSize: 1, sort: { key: 'createdAt', direction: 'desc' }, filters },
                signal,
            )

            if (items[0] !== undefined) return items[0].createdAt

            if (filters.createdFrom === undefined) return new Date(0)

            // The count has no createdFrom, so with nothing loaded it counts from just before it.
            return new Date(filters.createdFrom.getTime() - 1)
        },
        staleTime: Infinity,
    })
}

function ticketQuery(id: string) {
    return queryOptions({
        queryKey: ticketKeys.detail(id),
        queryFn: async ({ signal }) =>
            toTicketDetail(
                await request(`/tickets/${encodeURIComponent(id)}`, {
                    schema: ticketDetailResponseSchema,
                    signal,
                }),
            ),
    })
}

function newTicketCountQuery({ createdAfter, filters }: NewTicketCountParams) {
    return queryOptions({
        queryKey: ticketKeys.newCount({ createdAfter, filters }),
        queryFn:
            createdAfter === null
                ? skipToken
                : async ({ signal }) => {
                      const { count } = await request('/tickets/new-count', {
                          query: toNewTicketCountQuery(createdAfter, filters),
                          schema: newTicketCountResponseSchema,
                          signal,
                      })

                      return count
                  },
        refetchInterval: newTicketPollMs,
    })
}

const zoneOptionsQuery = queryOptions({
    queryKey: ticketKeys.zoneOptions,
    // Zones change rarely; without this every mount of a filter asks again.
    staleTime: 5 * 60_000,
    queryFn: async ({ signal }) =>
        toZoneOptions(await request('/zones', { schema: zoneOptionsResponseSchema, signal })),
})

// The previous page stays on screen while the next one loads.
export function useTickets(params: TicketListParams) {
    return useQuery({ ...ticketsQuery(params), placeholderData: keepPreviousData })
}

export function useTicket(id: string) {
    return useQuery(ticketQuery(id))
}

export function useNewestTicketTime(filters: TicketFilters) {
    return useQuery(newestTicketTimeQuery(filters))
}

// Polling stops while the tab is hidden: TanStack Query's refetchIntervalInBackground is off.
export function useNewTicketCount(params: NewTicketCountParams) {
    return useQuery(newTicketCountQuery(params))
}

/** Loads the rows again with the tickets that arrived since, and counts new ones from there. */
export function useShowNewTickets() {
    const queryClient = useQueryClient()

    return async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ticketKeys.lists }),
            queryClient.invalidateQueries({ queryKey: ticketKeys.newestTimes }),
        ])
    }
}

export function useTicketZoneOptions() {
    return useQuery(zoneOptionsQuery)
}
