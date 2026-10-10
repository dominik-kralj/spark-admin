import { Stack } from '@chakra-ui/react'
import { useParams } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { useCloseDetail } from '@/shared/lib/useCloseDetail'
import { useTicketFilters } from '@/shared/lib/useTicketFilters'
import { paths } from '@/shared/paths'
import { PageHeader } from '@/shared/ui/PageHeader'
import { TicketFilters } from '@/shared/ui/TicketFilters'

import { DailyTicketDetailDrawer } from './DailyTicketDetailDrawer'
import { DailyTicketList } from './DailyTicketList'
import { FiscalizeAgainProvider } from './FiscalizeAgainProvider'

export function DailyTicketsPage() {
    const t = useStrings()
    const { ticketId } = useParams()
    const filterValues = useTicketFilters()
    const closeDetail = useCloseDetail(paths.dailyTickets)

    return (
        <FiscalizeAgainProvider>
            <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
                <PageHeader title={t.nav.dailyTickets} description={t.dailyTickets.description} />

                <TicketFilters
                    label={t.dailyTickets.filters.label}
                    values={filterValues.values}
                    onApply={filterValues.apply}
                    onClear={filterValues.clear}
                />

                <DailyTicketList onClearFilters={filterValues.clear} />

                <DailyTicketDetailDrawer ticketId={ticketId} onClose={closeDetail} />
            </Stack>
        </FiscalizeAgainProvider>
    )
}
