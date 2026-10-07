import { Box, Drawer, HStack, IconButton, Portal } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useState, type ReactElement, type ReactNode } from 'react'

import { hr } from '@/shared/i18n/hr'

import { Logo } from './Logo'
import { NavItems } from './NavItems'

interface MenuDrawerProps {
    trigger: ReactElement
    width: string
    hasCloseButton?: boolean
    /** Close actions in it use Drawer.CloseTrigger. */
    footer: ReactNode
}

export function MenuDrawer({ trigger, width, hasCloseButton = false, footer }: MenuDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)

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
                    <Drawer.Content aria-label={hr.shell.menu} w={width} maxW="calc(100vw - 16px)">
                        <HStack
                            justify="space-between"
                            minH="14"
                            pl="4"
                            pr="1.5"
                            flex="none"
                            borderBottomWidth="1px"
                            borderColor="border"
                        >
                            <Logo />
                            {hasCloseButton && (
                                <Drawer.CloseTrigger asChild>
                                    <IconButton
                                        aria-label={hr.shell.closeMenu}
                                        variant="ghost"
                                        size="lg"
                                    >
                                        <X />
                                    </IconButton>
                                </Drawer.CloseTrigger>
                            )}
                        </HStack>

                        <Box as="nav" aria-label={hr.shell.mainNav} flex="1" overflowY="auto" p="2">
                            <NavItems
                                variant="drawer"
                                onNavigate={() => {
                                    setIsOpen(false)
                                }}
                            />
                        </Box>

                        <Box flex="none" p="3" borderTopWidth="1px" borderColor="border">
                            {footer}
                        </Box>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
