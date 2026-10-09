import { Button, Flex } from '@chakra-ui/react'
import { X } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

import { useTicketZoneOptions } from '../api/useTickets'
import { filterTags } from '../lib/filterTags'
import type { TicketFilterValues } from '../validators/ticketFilterForm'

interface FilterTagsProps {
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClearDrawerFilters: () => void
}

// From xl every filter is a field in the bar, which already shows its value.
export function FilterTags({ values, onApply, onClearDrawerFilters }: FilterTagsProps) {
    const t = useStrings()
    const f = t.tickets.filters
    const zones = useTicketZoneOptions()
    const tags = filterTags({ values, zones: zones.data ?? [], t })

    if (tags.length === 0) return null

    return (
        <Flex hideFrom="xl" wrap="wrap" align="center" gap="2">
            {tags.map((tag) => (
                <Button
                    key={tag.id}
                    size="sm"
                    variant="outline"
                    fontWeight="normal"
                    aria-label={f.remove(tag.label)}
                    onClick={() => {
                        onApply(tag.without)
                    }}
                >
                    {tag.label}
                    <X aria-hidden="true" />
                </Button>
            ))}

            <Button
                hideBelow="md"
                size="sm"
                variant="ghost"
                colorPalette="blue"
                onClick={onClearDrawerFilters}
            >
                {f.clearAll}
            </Button>
        </Flex>
    )
}
