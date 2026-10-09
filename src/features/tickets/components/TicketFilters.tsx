import { Stack } from '@chakra-ui/react'
import { useRef, useState } from 'react'

import { noFilterValues } from '../lib/ticketFilterValues'
import type { TicketFilterValues } from '../validators/ticketFilterForm'

import { FilterTags } from './FilterTags'
import { TicketFilterBar } from './TicketFilterBar'
import { TicketFilterDrawer } from './TicketFilterDrawer'

interface TicketFiltersProps {
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClear: () => void
}

export function TicketFilters({ values, onApply, onClear }: TicketFiltersProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const drawerTriggerRef = useRef<HTMLButtonElement>(null)

    // Below lg the plate has its own field on the page, so clearing the rest keeps it.
    function clearDrawerFilters() {
        onApply({ ...noFilterValues, plate: values.plate })
    }

    return (
        <Stack gap="3">
            <TicketFilterBar
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
