import { Stack } from '@chakra-ui/react'

import { hr } from '@/shared/i18n/hr'
import { PageHeader } from '@/shared/ui/PageHeader'

import { AddZoneButton } from './AddZoneButton'
import { ZoneList } from './ZoneList'

export function ZonesPage() {
    return (
        <Stack flex="1" minW="0" gap={{ base: '4', md: '5' }}>
            <PageHeader title={hr.nav.zones} action={<AddZoneButton />} />

            <ZoneList />
        </Stack>
    )
}
