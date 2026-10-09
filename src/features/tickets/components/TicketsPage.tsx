import { Stack } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import { TicketList } from './TicketList'

export function TicketsPage() {
    const t = useStrings()

    return (
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }}>
            <PageHeader title={t.nav.tickets} />

            <TicketList />
        </Stack>
    )
}
