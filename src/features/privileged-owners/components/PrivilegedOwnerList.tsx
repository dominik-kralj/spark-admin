import { Box, Button, Flex, Tabs } from '@chakra-ui/react'
import { CarFront, SearchX } from 'lucide-react'
import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useSortSearchParams, type Sort } from '@/shared/lib/useSortSearchParams'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { usePrivilegedOwners } from '../api/usePrivilegedOwners'
import { countByValidity, matchingPlate } from '../lib/filterPrivilegedOwners'
import {
    privilegedOwnerSortKeys,
    sortPrivilegedOwners,
    type PrivilegedOwnerSortKey,
} from '../lib/sortPrivilegedOwners'
import {
    readValidity,
    usePrivilegedOwnerFilters,
    validityFilters,
    type ValidityFilter,
} from '../lib/usePrivilegedOwnerFilters'
import { validityOf } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { AddPrivilegedOwnerButton } from './AddPrivilegedOwnerButton'
import { PlateSearch } from './PlateSearch'
import { PrivilegedOwnerCards } from './PrivilegedOwnerCards'
import { PrivilegedOwnerTable } from './PrivilegedOwnerTable'

const defaultSort: Sort<PrivilegedOwnerSortKey> = { key: 'validUntil', direction: 'desc' }

const skeletonColumnWidths = [1, 1, 1, 2, 3, 1]

interface PrivilegedOwnerListProps {
    onAdd: () => void
    onEdit: (owner: PrivilegedOwner) => void
}

export function PrivilegedOwnerList({ onAdd, onEdit }: PrivilegedOwnerListProps) {
    const t = useStrings()
    const owners = usePrivilegedOwners()
    const filters = usePrivilegedOwnerFilters()
    const { sort, sortBy } = useSortSearchParams(privilegedOwnerSortKeys, defaultSort)
    const searchRef = useRef<HTMLInputElement>(null)

    // Validity as of the last load, so a row never changes status while it is being read.
    const now = new Date(owners.dataUpdatedAt)
    const matching = matchingPlate(owners.data ?? [], filters.plateSearch)
    const counts = { all: matching.length, ...countByValidity(matching, now) }
    const visible = matching.filter(
        (owner) => filters.validity === 'all' || validityOf(owner, now) === filters.validity,
    )

    function clearSearch() {
        filters.setPlateSearch('')
        if (searchRef.current === null) return

        searchRef.current.value = ''
        searchRef.current.focus()
    }

    function tabLabel(validity: ValidityFilter) {
        const label = t.privilegedOwners.validity[validity]

        return owners.isSuccess
            ? t.privilegedOwners.validity.withCount(label, counts[validity])
            : label
    }

    function results() {
        if (owners.isPending) {
            return (
                <LoadingState
                    label={t.privilegedOwners.loading}
                    columnWidths={skeletonColumnWidths}
                />
            )
        }

        if (owners.isError) {
            return (
                <ErrorState
                    title={t.privilegedOwners.errorTitle}
                    error={owners.error}
                    onRetry={() => void owners.refetch()}
                    isRetrying={owners.isFetching}
                />
            )
        }

        if (owners.data.length === 0) {
            return (
                <EmptyState
                    icon={<CarFront />}
                    title={t.privilegedOwners.empty.title}
                    description={t.privilegedOwners.empty.description}
                    // The phone design keeps only the header's add button.
                    action={
                        <Box hideBelow="md">
                            <AddPrivilegedOwnerButton onClick={onAdd} />
                        </Box>
                    }
                />
            )
        }

        if (matching.length === 0) {
            return (
                <EmptyState
                    icon={<SearchX />}
                    title={t.privilegedOwners.noMatch.title}
                    description={t.privilegedOwners.noMatch.description}
                    action={
                        <Button variant="outline" onClick={clearSearch}>
                            {t.privilegedOwners.noMatch.clear}
                        </Button>
                    }
                />
            )
        }

        if (visible.length === 0 && filters.validity !== 'all') {
            const emptyTab = t.privilegedOwners.emptyTab[filters.validity]

            return (
                <EmptyState
                    icon={<CarFront />}
                    title={emptyTab.title}
                    description={emptyTab.description}
                />
            )
        }

        const sorted = sortPrivilegedOwners(visible, sort)

        return (
            <>
                <PrivilegedOwnerTable
                    owners={sorted}
                    now={now}
                    total={owners.data.length}
                    sort={sort}
                    onSort={sortBy}
                    onEdit={onEdit}
                />
                <PrivilegedOwnerCards owners={sorted} now={now} onEdit={onEdit} />
            </>
        )
    }

    return (
        <Tabs.Root
            value={filters.validity}
            onValueChange={({ value }) => {
                filters.setValidity(readValidity(value))
            }}
            variant="enclosed"
            fitted={{ base: true, md: false }}
            display="flex"
            flexDirection="column"
            flex="1"
            minH="0"
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'stretch', md: 'flex-end' }}
                justify="space-between"
                gap="3"
            >
                <PlateSearch
                    ref={searchRef}
                    defaultValue={filters.plateSearch}
                    onSearch={filters.setPlateSearch}
                />
                <Tabs.List aria-label={t.privilegedOwners.validity.label}>
                    {validityFilters.map((validity) => (
                        <Tabs.Trigger key={validity} value={validity}>
                            {tabLabel(validity)}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
            </Flex>

            {validityFilters.map((validity) => (
                <Tabs.Content
                    key={validity}
                    value={validity}
                    display="flex"
                    flexDirection="column"
                    flex="1"
                    minH="0"
                    pt={{ base: '4', md: '5' }}
                    pb="0"
                >
                    {validity === filters.validity && results()}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    )
}
