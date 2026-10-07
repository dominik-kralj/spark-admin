import { HStack, Skeleton, Span } from '@chakra-ui/react'
import { Landmark } from 'lucide-react'

import { useCityName } from '../api/useCityName'

export function CityName() {
    const cityName = useCityName()

    if (cityName.isPending) return <Skeleton h="5" w="32" />
    if (cityName.isError) return null

    return (
        <HStack gap="2" minW="0" color="spark.heading" fontWeight="semibold">
            <Landmark size="18" aria-hidden="true" />
            <Span truncate>{cityName.data}</Span>
        </HStack>
    )
}
