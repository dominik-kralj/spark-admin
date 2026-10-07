import { Box, HStack } from '@chakra-ui/react'
import { Link } from 'react-router'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

import { Logo } from './Logo'
import { NavItems } from './NavItems'

export function Sidebar() {
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
            <HStack
                asChild
                gap="2.5"
                h="16"
                px="5"
                borderBottomWidth="1px"
                borderColor="border"
                color="spark.heading"
            >
                <Link to={paths.home} aria-label={hr.shell.homeLink}>
                    <Logo />
                </Link>
            </HStack>

            <Box as="nav" aria-label={hr.shell.mainNav} p="3">
                <NavItems variant="sidebar" />
            </Box>
        </Box>
    )
}
