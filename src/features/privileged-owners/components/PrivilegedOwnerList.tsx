import { Flex, Tabs } from '@chakra-ui/react'
import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useSearchParam } from '@/shared/lib/useSearchParams'
import { useSortSearchParams, type Sort } from '@/shared/lib/useSortSearchParams'

import { usePrivilegedOwners } from '../api/usePrivilegedOwners'
import { countByValidity, filterByPlate, filterByValidity } from '../lib/filterPrivilegedOwners'
import { privilegedOwnerSortKeys, type PrivilegedOwnerSortKey } from '../lib/sortPrivilegedOwners'
import { readValidityFilter, toRows, validityFilters } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { PlateSearch } from './PlateSearch'
import { PrivilegedOwnerResults } from './PrivilegedOwnerResults'

const defaultSort: Sort<PrivilegedOwnerSortKey> = { key: 'validUntil', direction: 'desc' }

interface PrivilegedOwnerListProps {
    onAdd: () => void
    onEdit: (owner: PrivilegedOwner) => void
    onDelete: (owner: PrivilegedOwner) => void
}

export function PrivilegedOwnerList({ onAdd, onEdit, onDelete }: PrivilegedOwnerListProps) {
    const t = useStrings()
    const owners = usePrivilegedOwners()
    const [validityParam, setValidity] = useSearchParam('validity', 'all')
    const [plateSearch, setPlateSearch] = useSearchParam('plate', '')
    const { sort, sortBy } = useSortSearchParams(privilegedOwnerSortKeys, defaultSort)
    const searchRef = useRef<HTMLInputElement>(null)

    const validity = readValidityFilter(validityParam)
    // As of the last load, so a row never changes status while it is being read.
    const rows = toRows(owners.data ?? [], new Date(owners.dataUpdatedAt))
    const matching = filterByPlate(rows, plateSearch)
    const counts = countByValidity(matching)

    function clearSearch() {
        setPlateSearch('')
        if (searchRef.current === null) return

        searchRef.current.value = ''
        searchRef.current.focus()
    }

    return (
        <Tabs.Root
            value={validity}
            onValueChange={({ value }) => {
                setValidity(value)
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
                <PlateSearch ref={searchRef} defaultValue={plateSearch} onSearch={setPlateSearch} />
                <Tabs.List aria-label={t.privilegedOwners.validity.label}>
                    {validityFilters.map((filter) => {
                        const label = t.privilegedOwners.validity[filter]

                        return (
                            <Tabs.Trigger key={filter} value={filter}>
                                {owners.isSuccess
                                    ? t.privilegedOwners.validity.withCount(label, counts[filter])
                                    : label}
                            </Tabs.Trigger>
                        )
                    })}
                </Tabs.List>
            </Flex>

            {validityFilters.map((filter) => (
                <Tabs.Content
                    key={filter}
                    value={filter}
                    display="flex"
                    flexDirection="column"
                    flex="1"
                    minH="0"
                    pt={{ base: '4', md: '5' }}
                    pb="0"
                >
                    {filter === validity && (
                        <PrivilegedOwnerResults
                            query={owners}
                            matchingCount={matching.length}
                            visible={filterByValidity(matching, validity)}
                            validity={validity}
                            sort={sort}
                            onSort={sortBy}
                            onAdd={onAdd}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onClearSearch={clearSearch}
                        />
                    )}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    )
}
