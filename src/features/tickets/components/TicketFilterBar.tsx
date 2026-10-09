import { Alert, Badge, Box, Button, Field, Flex, HStack, IconButton, Stack } from '@chakra-ui/react'
import { CircleAlert, FilterX, SlidersHorizontal } from 'lucide-react'
import type { Ref } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

import { dateFilterError, dateFilterNames } from '../lib/dateFilterError'
import { activeDrawerFilterCount, noFilterValues } from '../lib/ticketFilterValues'
import { useTicketFilterForm } from '../lib/useTicketFilterForm'
import { toTicketFilterFormValues, type TicketFilterValues } from '../validators/ticketFilterForm'

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
    const { isDirty } = form.formState
    const drawerCount = activeDrawerFilterCount(values)
    const hasFilters = drawerCount > 0 || values.plate !== ''
    const errors = dateFilterNames.flatMap((name) => {
        const message = dateFilterError(form, name, t)

        return message === undefined ? [] : [`${f[name]}: ${message}`]
    })

    return (
        <Stack gap="3">
            {/* Under each field an error would push the bar out of line, so they gather here. */}
            {errors.length > 0 && (
                <Box hideBelow="xl">
                    {/* Not an alert: each field's own error text is, and is read with the field. */}
                    <Alert.Root status="error">
                        <Alert.Indicator>
                            <CircleAlert />
                        </Alert.Indicator>
                        <Alert.Description>
                            <strong>{f.notApplied}</strong> {errors.join(' ')}
                        </Alert.Description>
                    </Alert.Root>
                </Box>
            )}

            <Flex
                asChild
                direction={{ base: 'column', md: 'row' }}
                // From xl the fields align at the top, so an error under one only grows that field.
                align={{ base: 'stretch', md: 'flex-end', xl: 'flex-start' }}
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
                    <Box hideBelow="xl" flex="0 0 8.75rem">
                        <DateFilterField form={form} name="from" isErrorInAlert />
                    </Box>
                    <Box hideBelow="xl" flex="0 0 8.75rem">
                        <DateFilterField form={form} name="to" isErrorInAlert />
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
        </Stack>
    )
}
