import { Box, Button, Center, Drawer, Flex, IconButton, Image } from '@chakra-ui/react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

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
            <Center minH="16" w="full" flex="none" borderBottomWidth="1px" borderColor="border">
                <Link to={paths.home} aria-label={hr.shell.homeLink}>
                    <Image src={sparkMark} alt="" boxSize="8" />
                </Link>
            </Center>

            <Box as="nav" aria-label={hr.shell.mainNav} flex="1" overflowY="auto" py="3">
                <NavItems variant="rail" />
            </Box>

            <Center w="full" py="3" borderTopWidth="1px" borderColor="border">
                <MenuDrawer
                    width="16.5rem"
                    trigger={
                        <IconButton aria-label={hr.shell.expandMenu} variant="ghost" size="xl">
                            <PanelLeftOpen />
                        </IconButton>
                    }
                    footer={
                        <Drawer.CloseTrigger asChild>
                            <Button
                                variant="ghost"
                                size="xl"
                                w="full"
                                justifyContent="flex-start"
                                px="3"
                                color="gray.fg"
                                fontWeight="normal"
                            >
                                <PanelLeftClose aria-hidden="true" />
                                {hr.shell.collapseMenu}
                            </Button>
                        </Drawer.CloseTrigger>
                    }
                />
            </Center>
        </Flex>
    )
}
