import { Stack } from '@chakra-ui/react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { paths } from '@/shared/paths'
import { PageHeader } from '@/shared/ui/PageHeader'

import { wasOpenedFromList } from '../lib/detailLink'

import { TicketDetailDrawer } from './TicketDetailDrawer'
import { TicketList } from './TicketList'

export function TicketsPage() {
    const t = useStrings()
    const { ticketId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

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

            <TicketList />

            <TicketDetailDrawer ticketId={ticketId} onClose={closeDetail} />
        </Stack>
    )
}
