import { Skeleton, Stack, Text } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useAnnouncement } from '@/shared/lib/useAnnouncement'

const skeletonRows = [1, 2, 3, 4, 5]

export function CitySettingsLoading() {
    const t = useStrings()
    useAnnouncement(t.citySettings.loading)

    return (
        <Stack layerStyle="panel" gap="6" p={{ base: '4', md: '6' }}>
            {skeletonRows.map((row) => (
                <Stack key={row} gap="2" aria-hidden="true">
                    <Skeleton w="140px" h="3" />
                    <Skeleton h={{ base: '12', lg: '10' }} borderRadius="md" />
                </Stack>
            ))}

            <Text color="fg.muted">{t.citySettings.loading}</Text>
        </Stack>
    )
}
