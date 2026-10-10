import { Stack } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import { ReportsContent } from './ReportsContent'

export function ReportsPage() {
    const t = useStrings()

    return (
        // On a phone the toast sits below the buttons, not over them.
        <Stack flex="1" minW="0" minH="0" gap={{ base: '4', md: '5' }} pb={{ base: '24', md: '0' }}>
            <PageHeader title={t.nav.reports} />

            <ReportsContent />
        </Stack>
    )
}
