import { Stack } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { PageHeader } from '@/shared/ui/PageHeader'

import { AddZoneButton } from './AddZoneButton'
import { ZoneList } from './ZoneList'

export function ZonesPage() {
    const t = useStrings()

    return (
        <Stack flex="1" minW="0" gap={{ base: '4', md: '5' }}>
            <PageHeader title={t.nav.zones} action={<AddZoneButton />} />

            <ZoneList />
        </Stack>
    )
}
