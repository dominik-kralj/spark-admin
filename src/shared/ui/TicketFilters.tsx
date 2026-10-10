import { Stack } from '@chakra-ui/react'
import { useRef, useState } from 'react'

import { noFilterValues } from '@/shared/lib/ticketFilterValues'
import type { TicketFilterValues } from '@/shared/lib/ticketFilterForm'

import { FilterTags } from './FilterTags'
import { TicketFilterBar } from './TicketFilterBar'
import { TicketFilterDrawer } from './TicketFilterDrawer'

interface TicketFiltersProps {
    /** Names the search form: which list it filters. */
    label: string
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClear: () => void
}

export function TicketFilters({ label, values, onApply, onClear }: TicketFiltersProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const drawerTriggerRef = useRef<HTMLButtonElement>(null)

    // Below xl the plate has its own field on the page, so clearing the rest keeps it.
    function clearDrawerFilters() {
        onApply({ ...noFilterValues, plate: values.plate })
    }

    return (
        <Stack gap="3">
            <TicketFilterBar
                label={label}
                values={values}
                onApply={onApply}
                onClear={onClear}
                onOpenDrawer={() => {
                    setIsDrawerOpen(true)
                }}
                drawerTriggerRef={drawerTriggerRef}
            />

            <FilterTags
                values={values}
                onApply={onApply}
                onClearDrawerFilters={clearDrawerFilters}
            />

            <TicketFilterDrawer
                isOpen={isDrawerOpen}
                values={values}
                onApply={onApply}
                onClear={clearDrawerFilters}
                onClose={() => {
                    setIsDrawerOpen(false)
                }}
                finalFocusEl={() => drawerTriggerRef.current}
            />
        </Stack>
    )
}
