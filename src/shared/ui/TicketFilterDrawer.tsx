import { Button, Drawer, Flex, IconButton, Portal, SimpleGrid, Stack } from '@chakra-ui/react'
import { X } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

import { useTicketFilterForm } from '@/shared/lib/useTicketFilterForm'
import { activeDrawerFilterCount } from '@/shared/lib/ticketFilterValues'
import type { TicketFilterValues } from '@/shared/lib/ticketFilterForm'

import { DateFilterField, FiscalFilterField, ZoneFilterField } from './TicketFilterFields'

interface FilterDrawerFormProps {
    values: TicketFilterValues
    onApply: (values: TicketFilterValues) => void
    onClear: () => void
}

function FilterDrawerForm({ values, onApply, onClear }: FilterDrawerFormProps) {
    const t = useStrings()
    const f = t.ticketFilters
    const { form, submit } = useTicketFilterForm(values, onApply)
    const { isDirty } = form.formState

    return (
        <Flex asChild direction="column" flex="1" minH="0">
            <form noValidate onSubmit={(event) => void submit(event)}>
                <Drawer.Body p="4">
                    <Stack gap="5">
                        <SimpleGrid columns={2} columnGap="3" rowGap="5">
                            <DateFilterField form={form} name="from" />
                            <DateFilterField form={form} name="to" />
                        </SimpleGrid>
                        <ZoneFilterField form={form} />
                        <FiscalFilterField form={form} />
                    </Stack>
                </Drawer.Body>

                <Drawer.Footer borderTopWidth="1px" borderColor="border" p="4">
                    <Stack gap="2" w="full">
                        <Button type="submit" colorPalette="blue" disabled={!isDirty}>
                            {f.apply}
                        </Button>
                        <Button
                            variant="outline"
                            disabled={!isDirty && activeDrawerFilterCount(values) === 0}
                            onClick={onClear}
                        >
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

export function TicketFilterDrawer({
    isOpen,
    values,
    onApply,
    onClear,
    onClose,
    finalFocusEl,
}: TicketFilterDrawerProps) {
    const t = useStrings()
    const f = t.ticketFilters

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
