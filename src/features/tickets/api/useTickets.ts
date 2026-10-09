import { keepPreviousData, queryOptions, skipToken, useQuery } from '@tanstack/react-query'

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

interface NewTicketCountParams {
    /** The newest loaded ticket's time; null while nothing is loaded. */
    createdAfter: Date | null
    filters: TicketFilters
}

const ticketKeys = {
    list: (params: TicketListParams) => ['tickets', 'list', params] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
    newCount: ({ createdAfter, filters }: NewTicketCountParams) =>
        ['tickets', 'newCount', createdAfter, filters] as const,
}

function ticketsQuery(params: TicketListParams) {
    return queryOptions({
        queryKey: ticketKeys.list(params),
        queryFn: async ({ signal }) =>
            toTicketPage(
                await request('/tickets', {
                    query: toTicketListQuery(params),
                    schema: ticketPageResponseSchema,
                    signal,
                }),
            ),
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
    })
}

/** One page of tickets; while the next page loads, the previous one stays on screen. */
export function useTickets(params: TicketListParams) {
    return useQuery({ ...ticketsQuery(params), placeholderData: keepPreviousData })
}

export function useTicket(id: string) {
    return useQuery(ticketQuery(id))
}

export function useNewTicketCount(params: NewTicketCountParams) {
    return useQuery(newTicketCountQuery(params))
}
