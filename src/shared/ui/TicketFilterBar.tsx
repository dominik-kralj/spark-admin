import { Badge, Box, Button, Field, Flex, HStack, IconButton } from '@chakra-ui/react'
import { FilterX, SlidersHorizontal } from 'lucide-react'
import type { Ref } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

import { activeDrawerFilterCount, noFilterValues } from '@/shared/lib/ticketFilterValues'
import { useTicketFilterForm } from '@/shared/lib/useTicketFilterForm'
import { toTicketFilterFormValues, type TicketFilterValues } from '@/shared/lib/ticketFilterForm'

import {
    DateFilterField,
    FiscalFilterField,
    PlateFilterField,
    ZoneFilterField,
} from './TicketFilterFields'

interface TicketFilterBarProps {
    /** Names the search form: which list it filters. */
    label: string
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClear: () => void
    onOpenDrawer: () => void
    drawerTriggerRef: Ref<HTMLButtonElement>
}

export function TicketFilterBar({
    label,
    values,
    onApply,
    onClear,
    onOpenDrawer,
    drawerTriggerRef,
}: TicketFilterBarProps) {
    const t = useStrings()
    const f = t.ticketFilters
    const { form, submit } = useTicketFilterForm(values, onApply)
    const { isDirty } = form.formState
    const drawerCount = activeDrawerFilterCount(values)
    const hasFilters = drawerCount > 0 || values.plate !== ''

    return (
        <Flex
            asChild
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'flex-start' }}
            gap="3"
            p={{ xl: '3' }}
            bg={{ xl: 'bg' }}
            borderWidth={{ xl: '1px' }}
            borderColor="border"
            borderRadius={{ xl: 'lg' }}
        >
            <form
                role="search"
                aria-label={label}
                noValidate
                onSubmit={(event) => void submit(event)}
            >
                <Box flex={{ md: '1 1 auto' }} minW="0" maxW={{ md: '20rem', xl: '16rem' }}>
                    <PlateFilterField
                        form={form}
                        onClear={() => {
                            // An applied plate goes at once; a typed one only leaves the field.
                            if (values.plate !== '') onApply({ ...values, plate: '' })
                            form.setValue('plate', '', { shouldDirty: true })
                            form.setFocus('plate')
                        }}
                    />
                </Box>
                <Box hideBelow="xl" flex="0 0 10rem">
                    <DateFilterField form={form} name="from" />
                </Box>
                <Box hideBelow="xl" flex="0 0 10rem">
                    <DateFilterField form={form} name="to" />
                </Box>
                <Box hideBelow="xl" flex="0 0 7.5rem">
                    <ZoneFilterField form={form} />
                </Box>
                <Box hideBelow="xl" flex="0 0 9.5rem">
                    <FiscalFilterField form={form} />
                </Box>

                {/* An empty label above the buttons puts them level with the inputs. */}
                <Field.Root hideBelow="xl" w="auto">
                    <Field.Label aria-hidden="true" visibility="hidden">
                        {f.search}
                    </Field.Label>
                    <HStack gap="1">
                        <Button type="submit" colorPalette="blue" disabled={!isDirty}>
                            {f.search}
                        </Button>
                        <IconButton
                            aria-label={f.clear}
                            variant="ghost"
                            colorPalette="blue"
                            disabled={!isDirty && !hasFilters}
                            onClick={() => {
                                // The URL may already be clear, so the typed values go here too.
                                form.reset(toTicketFilterFormValues(noFilterValues))
                                onClear()
                            }}
                        >
                            <FilterX aria-hidden="true" />
                        </IconButton>
                    </HStack>
                </Field.Root>

                <Field.Root hideFrom="xl" w={{ md: 'auto' }}>
                    <Field.Label hideBelow="md" aria-hidden="true" visibility="hidden">
                        {f.open}
                    </Field.Label>
                    <Button
                        ref={drawerTriggerRef}
                        variant="outline"
                        w={{ base: 'full', md: 'auto' }}
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
                </Field.Root>
            </form>
        </Flex>
    )
}
