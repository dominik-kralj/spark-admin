import { Box, HStack, Image, Span } from '@chakra-ui/react'
import { Link, NavLink } from 'react-router'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

import { sections } from '../lib/sections'

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
                    <Image src={sparkMark} alt="" boxSize="7" flex="none" />
                    <Span fontSize="lg" fontWeight="semibold" letterSpacing="0.06em">
                        {hr.app.brand}
                    </Span>
                    <Span fontSize="caption" color="fg.muted">
                        {hr.app.product}
                    </Span>
                </Link>
            </HStack>

            <Box as="nav" aria-label={hr.shell.mainNav} p="3">
                <Box as="ul" display="flex" flexDirection="column" gap="0.5">
                    {sections.map(({ path, label, icon: Icon }) => (
                        <li key={path}>
                            <HStack
                                asChild
                                gap="3"
                                h="10"
                                px="3"
                                borderRadius="l2"
                                color="gray.fg"
                                _hover={{ bg: 'bg.subtle' }}
                                _currentPage={{
                                    bg: 'blue.subtle',
                                    color: 'blue.fg',
                                    fontWeight: 'semibold',
                                }}
                            >
                                <NavLink to={path}>
                                    <Icon size="18" aria-hidden="true" />
                                    {label}
                                </NavLink>
                            </HStack>
                        </li>
                    ))}
                </Box>
            </Box>
        </Box>
    )
}
