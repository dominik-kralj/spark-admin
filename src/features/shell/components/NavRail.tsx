import { Box, Button, Center, Flex, HStack, IconButton, Image } from '@chakra-ui/react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

import { Logo } from './Logo'
import { MenuDrawer } from './MenuDrawer'
import { NavItems } from './NavItems'

export function NavRail() {
    return (
        <Flex
            direction="column"
            align="center"
            position="sticky"
            top="0"
            h="100dvh"
            bg="bg"
            borderRightWidth="1px"
            borderColor="border"
        >
            <Center h="16" w="full" flex="none" borderBottomWidth="1px" borderColor="border">
                <Link to={paths.home} aria-label={hr.shell.homeLink}>
                    <Image src={sparkMark} alt="" boxSize="8" />
                </Link>
            </Center>

            <Box as="nav" aria-label={hr.shell.mainNav} flex="1" overflowY="auto" py="3">
                <NavItems variant="rail" />
            </Box>

            <Center w="full" py="3" borderTopWidth="1px" borderColor="border">
                <MenuDrawer
                    width="264px"
                    trigger={
                        <IconButton aria-label={hr.shell.expandMenu} variant="ghost" size="xl">
                            <PanelLeftOpen />
                        </IconButton>
                    }
                >
                    {(close) => (
                        <>
                            <HStack
                                gap="2.5"
                                h="16"
                                px="5"
                                flex="none"
                                borderBottomWidth="1px"
                                borderColor="border"
                                color="spark.heading"
                            >
                                <Logo />
                            </HStack>

                            <Box
                                as="nav"
                                aria-label={hr.shell.mainNav}
                                flex="1"
                                overflowY="auto"
                                p="3"
                            >
                                <NavItems variant="drawer" onNavigate={close} />
                            </Box>

                            <Box p="3" borderTopWidth="1px" borderColor="border">
                                <Button
                                    aria-expanded="true"
                                    variant="ghost"
                                    size="xl"
                                    w="full"
                                    justifyContent="flex-start"
                                    px="3"
                                    color="gray.fg"
                                    fontWeight="normal"
                                    onClick={close}
                                >
                                    <PanelLeftClose aria-hidden="true" />
                                    {hr.shell.collapseMenu}
                                </Button>
                            </Box>
                        </>
                    )}
                </MenuDrawer>
            </Center>
        </Flex>
    )
}
