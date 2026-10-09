import { Box, Button, Flex } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { SlidersHorizontal } from 'lucide-react'
import type { Ref } from 'react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'

import { activeDrawerFilterCount, type TicketFilterValues } from '../lib/ticketFilterValues'
import { ticketFilterFormSchema, toTicketFilterFormValues } from '../validators/ticketFilterForm'

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

/** From lg every filter is inline; below it the plate stays and the rest are behind Filteri. */
export function TicketFilterBar({
    values,
    onApply,
    onClear,
    onOpenDrawer,
    drawerTriggerRef,
}: TicketFilterBarProps) {
    const t = useStrings()
    const f = t.tickets.filters
    // `values` follows the URL, so a removed tag or a drawer change shows here too.
    const form = useForm({
        resolver: zodResolver(ticketFilterFormSchema),
        values: toTicketFilterFormValues(values),
    })
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
                onSubmit={(event) => void form.handleSubmit(onApply)(event)}
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
                        <Box
                            as="span"
                            display="inline-flex"
                            alignItems="center"
                            justifyContent="center"
                            h="5.5"
                            minW="5.5"
                            px="1.5"
                            borderRadius="full"
                            bg="spark.heading"
                            color="white"
                            textStyle="xs"
                        >
                            {drawerCount}
                        </Box>
                    )}
                </Button>
            </form>
        </Flex>
    )
}
