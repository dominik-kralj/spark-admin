import { Button, Flex, Text } from '@chakra-ui/react'
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

// Below lg the plate is in its own field on the page, so it has no tag there.
export function FilterTags({ values, onApply, onClearDrawerFilters }: FilterTagsProps) {
    const t = useStrings()
    const f = t.tickets.filters
    const zones = useTicketZoneOptions()
    const tags = filterTags({ values, zones: zones.data ?? [], t })
    const hasDrawerTags = tags.some((tag) => tag.id !== 'plate')

    if (tags.length === 0) return null

    return (
        <Flex hideBelow={hasDrawerTags ? undefined : 'lg'} wrap="wrap" align="center" gap="2">
            <Text hideBelow="lg" color="fg.muted">
                {f.active}
            </Text>

            {tags.map((tag) => (
                <Button
                    key={tag.id}
                    hideBelow={tag.id === 'plate' ? 'lg' : undefined}
                    size={{ base: 'sm', lg: 'xs' }}
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

            {hasDrawerTags && (
                <Button
                    hideBelow="md"
                    hideFrom="lg"
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    onClick={onClearDrawerFilters}
                >
                    {f.clearAll}
                </Button>
            )}
        </Flex>
    )
}
