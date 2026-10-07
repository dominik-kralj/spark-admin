import { Box, Button, Flex, HStack, IconButton, Stack } from '@chakra-ui/react'
import { LogOut, Menu, X } from 'lucide-react'

import { hr } from '@/shared/i18n/hr'

import { CityName } from './CityName'
import { Logo } from './Logo'
import { MenuDrawer } from './MenuDrawer'
import { NavItems } from './NavItems'
import type { ShellHeaderProps } from './ShellHeader'
import { SignedInUser } from './SignedInUser'

export function PhoneTopBar({ userName, onSignOut }: ShellHeaderProps) {
    return (
        <Flex
            as="header"
            align="center"
            gap="2"
            h="14"
            pl="1.5"
            pr="2"
            bg="bg"
            borderBottomWidth="1px"
            borderColor="border"
        >
            <MenuDrawer
                width="304px"
                trigger={
                    <IconButton aria-label={hr.shell.openMenu} variant="ghost" size="lg">
                        <Menu />
                    </IconButton>
                }
            >
                {(close) => (
                    <>
                        <HStack
                            justify="space-between"
                            h="14"
                            pl="4"
                            pr="1.5"
                            borderBottomWidth="1px"
                            borderColor="border"
                        >
                            <HStack gap="2.5" color="spark.heading">
                                <Logo />
                            </HStack>
                            <IconButton
                                aria-label={hr.shell.closeMenu}
                                variant="ghost"
                                size="lg"
                                onClick={close}
                            >
                                <X />
                            </IconButton>
                        </HStack>

                        <Box as="nav" aria-label={hr.shell.mainNav} flex="1" overflowY="auto" p="2">
                            <NavItems variant="drawer" onNavigate={close} />
                        </Box>

                        <Stack gap="3" p="4" borderTopWidth="1px" borderColor="border">
                            <Stack gap="1">
                                <CityName />
                                <SignedInUser name={userName} />
                            </Stack>
                            <Button variant="outline" size="xl" onClick={onSignOut}>
                                <LogOut aria-hidden="true" />
                                {hr.shell.signOut}
                            </Button>
                        </Stack>
                    </>
                )}
            </MenuDrawer>

            <CityName />
        </Flex>
    )
}
