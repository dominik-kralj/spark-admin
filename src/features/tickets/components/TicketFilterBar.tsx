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
            align={{ base: 'stretch', md: 'flex-end' }}
            gap="3"
            p={{ xl: '3' }}
            bg={{ xl: 'bg' }}
            borderWidth={{ xl: '1px' }}
            borderColor="border"
            borderRadius={{ xl: 'lg' }}
        >
            <form
                role="search"
                aria-label={f.label}
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <Box flex={{ md: '1 1 auto' }} minW="0">
                    <PlateFilterField form={form} />
                </Box>
                <Box hideBelow="xl" flex="0 0 8.75rem">
                    <DateFilterField form={form} name="from" />
                </Box>
                <Box hideBelow="xl" flex="0 0 8.75rem">
                    <DateFilterField form={form} name="to" />
                </Box>
                <Box hideBelow="xl" flex="0 0 7.5rem">
                    <ZoneFilterField form={form} />
                </Box>
                <Box hideBelow="xl" flex="0 0 9.5rem">
                    <FiscalFilterField form={form} />
                </Box>

                <Button hideBelow="xl" type="submit" colorPalette="blue">
                    {f.search}
                </Button>
                <Button hideBelow="xl" variant="ghost" colorPalette="blue" onClick={onClear}>
                    {f.clear}
                </Button>

                <Button
                    ref={drawerTriggerRef}
                    hideFrom="xl"
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
