import { Flex, Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface TablePanelProps {
    label: string
    /** The total (and a pager) under the rows; it stays in view while the rows scroll. */
    footer: ReactNode
    /** True while new rows load behind the current ones. */
    isBusy?: boolean
    children: ReactNode
}

/** The table from md up: it fills the page's spare height and scrolls only its rows. */
export function TablePanel({ label, footer, isBusy = false, children }: TablePanelProps) {
    return (
        <Flex
            hideBelow="md"
            direction="column"
            flex="0 1 auto"
            minH="0"
            layerStyle="panel"
            overflow="hidden"
        >
            <Table.ScrollArea flex="1" minH="0" overflowY="auto">
                <Table.Root aria-label={label} aria-busy={isBusy} stickyHeader>
                    {children}
                </Table.Root>
            </Table.ScrollArea>

            <Flex
                wrap="wrap"
                align="center"
                justify="space-between"
                gap="3"
                px="4"
                py="3"
                borderTopWidth="1px"
                textStyle="sm"
                color="fg.muted"
            >
                {footer}
            </Flex>
        </Flex>
    )
}
