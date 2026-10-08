import { Box, Flex } from '@chakra-ui/react'
import { Link } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { paths } from '@/shared/paths'

import { Logo } from './Logo'
import { NavItems } from './NavItems'

export function Sidebar() {
    const t = useStrings()

    return (
        <Box
            position="sticky"
            top="0"
            h="100dvh"
            overflowY="auto"
            bg="bg"
            borderRightWidth="1px"
            borderColor="border"
        >
            <Flex
                asChild
                align="center"
                minH="16"
                px="5"
                borderBottomWidth="1px"
                borderColor="border"
            >
                <Link to={paths.home} aria-label={t.shell.homeLink}>
                    <Logo />
                </Link>
            </Flex>

            <Box as="nav" aria-label={t.shell.mainNav} p="3">
                <NavItems variant="sidebar" />
            </Box>
        </Box>
    )
}
