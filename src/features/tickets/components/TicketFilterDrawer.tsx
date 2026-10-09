import { Button, Drawer, Flex, IconButton, Portal, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'

import type { TicketFilterValues } from '../lib/ticketFilterValues'
import { ticketFilterFormSchema, toTicketFilterFormValues } from '../validators/ticketFilterForm'

import { DateFilterField, FiscalFilterField, ZoneFilterField } from './TicketFilterFields'

interface FilterDrawerFormProps {
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClear: () => void
}

// Mounted with the drawer, so each opening starts from the filters in use.
function FilterDrawerForm({ values, onApply, onClear }: FilterDrawerFormProps) {
    const t = useStrings()
    const f = t.tickets.filters
    const form = useForm({
        resolver: zodResolver(ticketFilterFormSchema),
        defaultValues: toTicketFilterFormValues(values),
    })

    return (
        <Flex asChild direction="column" flex="1" minH="0">
            <form noValidate onSubmit={(event) => void form.handleSubmit(onApply)(event)}>
                <Drawer.Body p="4">
                    <Stack gap="5">
                        {/* One column: with its calendar button, a date does not fit half the drawer. */}
                        <DateFilterField form={form} name="from" />
                        <DateFilterField form={form} name="to" />
                        <ZoneFilterField form={form} />
                        <FiscalFilterField form={form} />
                    </Stack>
                </Drawer.Body>

                <Drawer.Footer borderTopWidth="1px" borderColor="border" p="4">
                    <Stack gap="2" w="full">
                        <Button type="submit" colorPalette="blue">
                            {f.apply}
                        </Button>
                        <Button variant="outline" onClick={onClear}>
                            {f.clearAll}
                        </Button>
                    </Stack>
                </Drawer.Footer>
            </form>
        </Flex>
    )
}

interface TicketFilterDrawerProps extends FilterDrawerFormProps {
    isOpen: boolean
    onClose: () => void
    finalFocusEl: () => HTMLElement | null
}

/** Full screen on a phone, a side drawer on a tablet; nothing applies until Prikaži rezultate. */
export function TicketFilterDrawer({
    isOpen,
    values,
    onApply,
    onClear,
    onClose,
    finalFocusEl,
}: TicketFilterDrawerProps) {
    const t = useStrings()
    const f = t.tickets.filters

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={({ open }) => {
                if (!open) onClose()
            }}
            finalFocusEl={finalFocusEl}
            lazyMount
            unmountOnExit
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content w="full" maxW={{ base: '100vw', md: 'sm' }}>
                        <Flex
                            justify="space-between"
                            align="center"
                            minH="14"
                            pl="4"
                            pr="1.5"
                            flex="none"
                            borderBottomWidth="1px"
                            borderColor="border"
                        >
                            <Drawer.Title textStyle="lg">{f.drawerTitle}</Drawer.Title>
                            <Drawer.CloseTrigger asChild position="static">
                                <IconButton aria-label={f.close} variant="ghost">
                                    <X />
                                </IconButton>
                            </Drawer.CloseTrigger>
                        </Flex>

                        <FilterDrawerForm
                            values={values}
                            onApply={(applied) => {
                                onApply(applied)
                                onClose()
                            }}
                            onClear={() => {
                                onClear()
                                onClose()
                            }}
                        />
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
