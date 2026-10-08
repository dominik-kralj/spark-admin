import { Box, Button, Center, Drawer, Flex, IconButton, Image, Stack } from '@chakra-ui/react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { useStrings } from '@/shared/i18n/useStrings'
import { paths } from '@/shared/paths'
import { LanguageMenu } from '@/shared/ui/LanguageMenu'

import { MenuDrawer } from './MenuDrawer'
import { NavItems } from './NavItems'

export function NavRail() {
    const t = useStrings()

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
                <Link to={paths.home} aria-label={t.shell.homeLink}>
                    <Image src={sparkMark} alt="" boxSize="8" />
                </Link>
            </Center>

            <Box as="nav" aria-label={t.shell.mainNav} flex="1" overflowY="auto" py="3">
                <NavItems variant="rail" />
            </Box>

            <Center w="full" py="3" borderTopWidth="1px" borderColor="border">
                <MenuDrawer
                    width="16.5rem"
                    trigger={
                        <IconButton aria-label={t.shell.expandMenu} variant="ghost" size="xl">
                            <PanelLeftOpen />
                        </IconButton>
                    }
                    footer={
                        <Stack gap="2">
                            <LanguageMenu variant="row" portalled={false} />
                            <Drawer.CloseTrigger asChild position="static">
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
                                    {t.shell.collapseMenu}
                                </Button>
                            </Drawer.CloseTrigger>
                        </Stack>
                    }
                />
            </Center>
        </Flex>
    )
}
