import { chakra, Table } from '@chakra-ui/react'
import { ArrowDown, ArrowUp } from 'lucide-react'

import type { SortDirection } from '@/shared/lib/useSortSearchParams'

interface SortableColumnHeaderProps {
    label: string
    direction: SortDirection
    onSort: () => void
}

const ariaSort = { asc: 'ascending', desc: 'descending' } as const

const sortIcon = { asc: ArrowUp, desc: ArrowDown } as const

export function SortableColumnHeader({ label, direction, onSort }: SortableColumnHeaderProps) {
    const Icon = sortIcon[direction]

    return (
        <Table.ColumnHeader aria-sort={ariaSort[direction]}>
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
