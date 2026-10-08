import { Box, HStack, type StackProps } from '@chakra-ui/react'
import { NavLink } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'

import { sections } from '../lib/sections'

type NavItemsVariant = 'sidebar' | 'drawer' | 'rail'

interface NavItemsProps {
    variant: NavItemsVariant
    onNavigate?: () => void
}

const itemStyles: Record<NavItemsVariant, StackProps> = {
    sidebar: { h: '10', px: '3', gap: '3' },
    drawer: { minH: '12', px: '3', gap: '3', fontSize: 'md' },
    rail: { boxSize: '12', justifyContent: 'center' },
}

export function NavItems({ variant, onNavigate }: NavItemsProps) {
    const t = useStrings()
    const isIconOnly = variant === 'rail'

    return (
        <Box as="ul" display="flex" flexDirection="column" alignItems="stretch" gap="0.5">
            {sections.map(({ path, labelKey, icon: Icon }) => (
                <li key={path}>
                    <HStack
                        asChild
                        {...itemStyles[variant]}
                        borderRadius="l2"
                        color="gray.fg"
                        _hover={{ bg: 'bg.subtle' }}
                        _currentPage={{
                            bg: 'blue.subtle',
                            color: 'blue.fg',
                            fontWeight: 'semibold',
                        }}
                    >
                        <NavLink
                            to={path}
                            aria-label={isIconOnly ? t.nav[labelKey] : undefined}
                            onClick={onNavigate}
                        >
                            <Icon size={isIconOnly ? 22 : 18} aria-hidden="true" />
                            {!isIconOnly && t.nav[labelKey]}
                        </NavLink>
                    </HStack>
                </li>
            ))}
        </Box>
    )
}
