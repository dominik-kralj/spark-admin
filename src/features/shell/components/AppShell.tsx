import { Flex, Grid, SkipNavContent, SkipNavLink } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Outlet } from 'react-router'

import { hr } from '@/shared/i18n/hr'
import { LiveRegion } from '@/shared/ui/LiveRegion'

import { useShellLayout, type ShellLayout } from '../lib/useShellLayout'

import { NavRail } from './NavRail'
import { PhoneTopBar } from './PhoneTopBar'
import { ShellHeader, type ShellUserProps } from './ShellHeader'
import { Sidebar } from './Sidebar'

type AppShellProps = ShellUserProps

const columns: Record<ShellLayout, string> = {
    phone: 'minmax(0, 1fr)',
    tablet: '4.5rem minmax(0, 1fr)',
    desktop: '15.5rem minmax(0, 1fr)',
}

const sideNav: Record<ShellLayout, ReactNode> = {
    phone: null,
    tablet: <NavRail />,
    desktop: <Sidebar />,
}

export function AppShell({ userName, onSignOut }: AppShellProps) {
    const layout = useShellLayout()

    // main keeps its place in the tree at every width, so a resize never remounts the page.
    return (
        <Grid templateColumns={columns[layout]} minH="100dvh">
            <SkipNavLink>{hr.shell.skipToContent}</SkipNavLink>
            <LiveRegion />

            {sideNav[layout]}

            <Flex direction="column" minW="0">
                {layout === 'phone' ? (
                    <PhoneTopBar userName={userName} onSignOut={onSignOut} />
                ) : (
                    <ShellHeader userName={userName} onSignOut={onSignOut} />
                )}

                <SkipNavContent
                    as="main"
                    display="flex"
                    flex="1"
                    p={{ base: '4', md: '6', lg: '8' }}
                >
                    <Outlet />
                </SkipNavContent>
            </Flex>
        </Grid>
    )
}
