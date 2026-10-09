import { chakra, Table, type TableColumnHeaderProps } from '@chakra-ui/react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import type { SortDirection } from '@/shared/lib/useSortSearchParams'

interface SortableColumnHeaderProps extends Pick<
    TableColumnHeaderProps,
    'hideBelow' | 'textAlign'
> {
    label: string
    /** null while the list is sorted by another column. */
    direction: SortDirection | null
    onSort: () => void
}

const ariaSort = { asc: 'ascending', desc: 'descending' } as const

const sortIcon = { asc: ArrowUp, desc: ArrowDown } as const

export function SortableColumnHeader({
    label,
    direction,
    onSort,
    ...columnProps
}: SortableColumnHeaderProps) {
    const Icon = direction === null ? ChevronsUpDown : sortIcon[direction]

    return (
        <Table.ColumnHeader
            aria-sort={direction === null ? undefined : ariaSort[direction]}
            {...columnProps}
        >
            <chakra.button
                type="button"
                display="inline-flex"
                alignItems="center"
                gap="1.5"
                h="11"
                fontWeight="semibold"
                color="spark.heading"
                cursor="pointer"
                onClick={onSort}
            >
                {label}
                <Icon size="14" aria-hidden="true" />
            </chakra.button>
        </Table.ColumnHeader>
    )
}
