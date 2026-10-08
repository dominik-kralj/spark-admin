import { Flex, Table, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface TablePanelProps {
    label: string
    /** The total under the rows; it stays in view while the rows scroll. */
    footer: string
    /** Table.Header and Table.Body. */
    children: ReactNode
}

/**
 * The table layout from md up. It takes the height left on the page and scrolls its rows
 * under a sticky header, so a long list never scrolls the page.
 */
export function TablePanel({ label, footer, children }: TablePanelProps) {
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
                <Table.Root aria-label={label} stickyHeader>
                    {children}
                </Table.Root>
            </Table.ScrollArea>

            <Text px="4" py="3" borderTopWidth="1px" textStyle="sm" color="fg.muted">
                {footer}
            </Text>
        </Flex>
    )
}
