import { Badge, Box, Button, Flex } from '@chakra-ui/react'
import { SlidersHorizontal } from 'lucide-react'
import type { Ref } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

import { activeDrawerFilterCount } from '../lib/ticketFilterValues'
import { useTicketFilterForm } from '../lib/useTicketFilterForm'
import type { TicketFilterValues } from '../validators/ticketFilterForm'

import {
    DateFilterField,
    FiscalFilterField,
    PlateFilterField,
    ZoneFilterField,
} from './TicketFilterFields'

interface TicketFilterBarProps {
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClear: () => void
    onOpenDrawer: () => void
    drawerTriggerRef: Ref<HTMLButtonElement>
}

export function TicketFilterBar({
    values,
    onApply,
    onClear,
    onOpenDrawer,
    drawerTriggerRef,
}: TicketFilterBarProps) {
    const t = useStrings()
    const f = t.tickets.filters
    const { form, submit } = useTicketFilterForm(values, onApply)
    const drawerCount = activeDrawerFilterCount(values)

    return (
        <Flex
            asChild
            direction={{ base: 'column', md: 'row' }}
            wrap={{ lg: 'wrap' }}
            align={{ base: 'stretch', md: 'flex-end' }}
            gap="3"
            p={{ lg: '4' }}
            bg={{ lg: 'bg' }}
            borderWidth={{ lg: '1px' }}
            borderColor="border"
            borderRadius={{ lg: 'lg' }}
        >
            <form
                role="search"
                aria-label={f.label}
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <Box flex={{ md: '1 1 12rem' }} minW="0">
                    <PlateFilterField form={form} />
                </Box>
                <Box hideBelow="lg" flex="0 0 10rem">
                    <DateFilterField form={form} name="from" />
                </Box>
                <Box hideBelow="lg" flex="0 0 10rem">
                    <DateFilterField form={form} name="to" />
                </Box>
                <Box hideBelow="lg" flex="0 0 8.5rem">
                    <ZoneFilterField form={form} />
                </Box>
                <Box hideBelow="lg" flex="0 0 10.5rem">
                    <FiscalFilterField form={form} />
                </Box>

                <Button hideBelow="lg" type="submit" colorPalette="blue">
                    {f.search}
                </Button>
                <Button hideBelow="lg" variant="ghost" colorPalette="blue" onClick={onClear}>
                    {f.clear}
                </Button>

                <Button
                    ref={drawerTriggerRef}
                    hideFrom="lg"
                    variant="outline"
                    aria-label={drawerCount > 0 ? f.openWithCount(drawerCount) : undefined}
                    onClick={onOpenDrawer}
                >
                    <SlidersHorizontal aria-hidden="true" />
                    {f.open}
                    {drawerCount > 0 && (
                        <Badge variant="solid" borderRadius="full" bg="spark.heading">
                            {drawerCount}
                        </Badge>
                    )}
                </Button>
            </form>
        </Flex>
    )
}
