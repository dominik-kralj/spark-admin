import { Drawer, Portal } from '@chakra-ui/react'
import { useState, type ReactElement, type ReactNode } from 'react'

import { hr } from '@/shared/i18n/hr'

interface MenuDrawerProps {
    trigger: ReactElement
    width: string
    children: (close: () => void) => ReactNode
}

/** The navigation menu over the page; Chakra traps focus, closes on Escape and refocuses the trigger. */
export function MenuDrawer({ trigger, width, children }: MenuDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)

    function close() {
        setIsOpen(false)
    }

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={({ open }) => {
                setIsOpen(open)
            }}
            placement="start"
        >
            <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>

            <Portal>
                <Drawer.Backdrop bg="spark.scrim" />
                <Drawer.Positioner>
                    <Drawer.Content aria-label={hr.shell.menu} w={width} maxW={width}>
                        {children(close)}
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
