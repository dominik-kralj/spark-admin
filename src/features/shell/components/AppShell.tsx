import { Flex, Grid, SkipNavContent, SkipNavLink } from '@chakra-ui/react'
import { Outlet } from 'react-router'

import { hr } from '@/shared/i18n/hr'

import { ShellHeader, type ShellHeaderProps } from './ShellHeader'
import { Sidebar } from './Sidebar'

export function AppShell({ userName, onSignOut }: ShellHeaderProps) {
    return (
        <Grid templateColumns="248px minmax(0, 1fr)" minH="100dvh">
            <SkipNavLink>{hr.shell.skipToContent}</SkipNavLink>

            <Sidebar />

            <Flex direction="column" minW="0">
                <ShellHeader userName={userName} onSignOut={onSignOut} />

                <SkipNavContent as="main" display="flex" flex="1" p="8">
                    <Outlet />
                </SkipNavContent>
            </Flex>
        </Grid>
    )
}
