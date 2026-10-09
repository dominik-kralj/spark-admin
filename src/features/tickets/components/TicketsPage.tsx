import { Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useParams } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { toTicketFilters } from '@/shared/lib/ticketFilterValues'
import { useCloseDetail } from '@/shared/lib/useCloseDetail'
import { pageParam } from '@/shared/lib/usePageSearchParam'
import { useSearchParams } from '@/shared/lib/useSearchParams'
import { sortParams } from '@/shared/lib/useSortSearchParams'
import { useTicketFilters } from '@/shared/lib/useTicketFilters'
import { paths } from '@/shared/paths'
import { PageHeader } from '@/shared/ui/PageHeader'
import { TicketFilters } from '@/shared/ui/TicketFilters'

import { useShowNewTickets } from '../api/useTickets'

import { NewTicketsBanner } from './NewTicketsBanner'
import { TicketDetailDrawer } from './TicketDetailDrawer'
import { TicketList } from './TicketList'

// New tickets are the newest, so showing them means the first page in the default order.
const newestFirstParams = Object.fromEntries([pageParam, ...sortParams].map((name) => [name, null]))

export function TicketsPage() {
    const t = useStrings()
    const { ticketId } = useParams()
    const { updateSearchParams } = useSearchParams()
    const filterValues = useTicketFilters()
    const filters = toTicketFilters(filterValues.values)
    const refreshTickets = useShowNewTickets()
    const closeDetail = useCloseDetail(paths.tickets)
    const [focusFirstRowAfter, setFocusFirstRowAfter] = useState<number | null>(null)

    function showNewTickets() {
        setFocusFirstRowAfter(Date.now())
        updateSearchParams(newestFirstParams)
        void refreshTickets()
    }

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader title={t.nav.tickets} />

            <TicketFilters
                label={t.tickets.filters.label}
                values={filterValues.values}
                onApply={filterValues.apply}
                onClear={filterValues.clear}
            />

            <NewTicketsBanner filters={filters} onShow={showNewTickets} />

            <TicketList
                filters={filters}
                onClearFilters={filterValues.clear}
                focusFirstRowAfter={focusFirstRowAfter}
                onFirstRowFocused={() => {
                    setFocusFirstRowAfter(null)
                }}
            />

            <TicketDetailDrawer ticketId={ticketId} onClose={closeDetail} />
        </Stack>
    )
}
