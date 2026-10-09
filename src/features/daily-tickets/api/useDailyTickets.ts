import {
    keepPreviousData,
    queryOptions,
    useMutation,
    useMutationState,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

import { request } from '@/shared/api'

import {
    dailyTicketDetailResponseSchema,
    dailyTicketPageResponseSchema,
    toDailyTicketDetail,
    toDailyTicketListQuery,
    toDailyTicketPage,
    toListItem,
    type DailyTicketDetail,
    type DailyTicketListParams,
    type DailyTicketPage,
} from '../validators/dailyTicket'

const dailyTicketKeys = {
    lists: ['dailyTickets', 'list'] as const,
    list: (params: DailyTicketListParams) => ['dailyTickets', 'list', params] as const,
    detail: (id: string) => ['dailyTickets', 'detail', id] as const,
    fiscalize: ['dailyTickets', 'fiscalize'] as const,
}

function dailyTicketsQuery(params: DailyTicketListParams) {
    return queryOptions({
        queryKey: dailyTicketKeys.list(params),
        queryFn: async ({ signal }) =>
            toDailyTicketPage(
                await request('/daily-tickets', {
                    query: toDailyTicketListQuery(params),
                    schema: dailyTicketPageResponseSchema,
                    signal,
                }),
            ),
    })
}

function dailyTicketQuery(id: string) {
    return queryOptions({
        queryKey: dailyTicketKeys.detail(id),
        queryFn: async ({ signal }) =>
            toDailyTicketDetail(
                await request(`/daily-tickets/${encodeURIComponent(id)}`, {
                    schema: dailyTicketDetailResponseSchema,
                    signal,
                }),
            ),
    })
}

// The previous page stays on screen while the next one loads.
export function useDailyTickets(params: DailyTicketListParams) {
    return useQuery({ ...dailyTicketsQuery(params), placeholderData: keepPreviousData })
}

export function useDailyTicket(id: string) {
    return useQuery(dailyTicketQuery(id))
}

function withRow(page: DailyTicketPage | undefined, detail: DailyTicketDetail) {
    if (page === undefined) return undefined

    return {
        ...page,
        items: page.items.map((item) => (item.id === detail.id ? toListItem(detail) : item)),
    }
}

/**
 * "Fiskaliziraj ponovno": the server answers with the ticket's new state, which goes into the
 * detail and every loaded list page, so the list and the detail agree without a refetch.
 */
export function useFiscalizeDailyTicket() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationKey: dailyTicketKeys.fiscalize,
        mutationFn: async (id: string) =>
            toDailyTicketDetail(
                await request(`/daily-tickets/${encodeURIComponent(id)}/fiscalize`, {
                    method: 'POST',
                    schema: dailyTicketDetailResponseSchema,
                }),
            ),
        onSuccess: (detail) => {
            queryClient.setQueryData(dailyTicketKeys.detail(detail.id), detail)
            queryClient.setQueriesData<DailyTicketPage>(
                { queryKey: dailyTicketKeys.lists },
                (page) => withRow(page, detail),
            )
        },
        // A refusal means the ticket moved on elsewhere; reading it again shows where it is.
        onError: async (_error, id) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: dailyTicketKeys.detail(id) }),
                queryClient.invalidateQueries({ queryKey: dailyTicketKeys.lists }),
            ])
        },
    })
}

/** Whether this ticket is being fiscalized, from any button that started it. */
export function useIsFiscalizing(id: string): boolean {
    const pendingIds = useMutationState({
        filters: { mutationKey: dailyTicketKeys.fiscalize, status: 'pending' },
        select: (mutation) => mutation.state.variables,
    })

    return pendingIds.includes(id)
}
