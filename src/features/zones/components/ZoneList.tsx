import { Box } from '@chakra-ui/react'
import { MapPin } from 'lucide-react'

import { hr } from '@/shared/i18n/hr'
import { useSortSearchParams, type Sort } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useZones } from '../api/useZones'
import { sortZonesByCode } from '../lib/sortZones'

import { AddZoneButton } from './AddZoneButton'
import { ZoneCards } from './ZoneCards'
import { ZoneTable } from './ZoneTable'

const sortKeys = ['code'] as const

const defaultSort: Sort<(typeof sortKeys)[number]> = { key: 'code', direction: 'asc' }

const skeletonColumnWidths = [1, 2, 1, 1, 1, 1, 1]

export function ZoneList() {
    const zones = useZones()
    const { sort, sortBy } = useSortSearchParams(sortKeys, defaultSort)

    if (zones.isPending) {
        return <LoadingState label={hr.zones.loading} columnWidths={skeletonColumnWidths} />
    }

    if (zones.isError) {
        return (
            <ErrorState
                title={hr.zones.errorTitle}
                error={zones.error}
                onRetry={() => void zones.refetch()}
                isRetrying={zones.isFetching}
            />
        )
    }

    if (zones.data.length === 0) {
        return (
            <EmptyState
                icon={<MapPin />}
                title={hr.zones.empty.title}
                description={hr.zones.empty.description}
                // The phone design keeps only the header's add button.
                action={
                    <Box hideBelow="md">
                        <AddZoneButton />
                    </Box>
                }
            />
        )
    }

    const sortedZones = sortZonesByCode(zones.data, sort.direction)

    return (
        <>
            <ZoneTable
                zones={sortedZones}
                codeSortDirection={sort.direction}
                onSortByCode={() => {
                    sortBy('code')
                }}
            />
            <ZoneCards zones={sortedZones} />
        </>
    )
}
