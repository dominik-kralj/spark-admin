import { Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { pageParam } from '@/shared/lib/usePageSearchParam'
import { useSearchParams } from '@/shared/lib/useSearchParams'
import { sortParams } from '@/shared/lib/useSortSearchParams'
import { paths } from '@/shared/paths'
import { PageHeader } from '@/shared/ui/PageHeader'

import { useShowNewTickets } from '../api/useTickets'
import { wasOpenedFromList } from '../lib/detailLink'
import { toTicketFilters } from '../lib/ticketFilterValues'
import { useTicketFilters } from '../lib/useTicketFilters'

import { NewTicketsBanner } from './NewTicketsBanner'
import { TicketDetailDrawer } from './TicketDetailDrawer'
import { TicketFilters } from './TicketFilters'
import { TicketList } from './TicketList'

// New tickets are the newest, so showing them means the first page in the default order.
const newestFirstParams = Object.fromEntries([pageParam, ...sortParams].map((name) => [name, null]))

export function TicketsPage() {
    const t = useStrings()
    const { ticketId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const { updateSearchParams } = useSearchParams()
    const filterValues = useTicketFilters()
    const filters = toTicketFilters(filterValues.values)
    const refreshTickets = useShowNewTickets()
    const [focusFirstRowAfter, setFocusFirstRowAfter] = useState<number | null>(null)

    function showNewTickets() {
        setFocusFirstRowAfter(Date.now())
        updateSearchParams(newestFirstParams)
        void refreshTickets()
    }

    function closeDetail() {
        // Back, so the browser's own Back does not reopen the detail.
        if (wasOpenedFromList(location.state)) {
            void navigate(-1)
            return
        }
        void navigate({ pathname: paths.tickets, search: location.search }, { replace: true })
    }

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader title={t.nav.tickets} />

            <TicketFilters
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
