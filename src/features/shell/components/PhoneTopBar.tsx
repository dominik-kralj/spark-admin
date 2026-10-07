import { Button, Flex, IconButton, Stack } from '@chakra-ui/react'
import { LogOut, Menu } from 'lucide-react'

import { hr } from '@/shared/i18n/hr'

import { CityName } from './CityName'
import { MenuDrawer } from './MenuDrawer'
import type { ShellUserProps } from './ShellHeader'
import { SignedInUser } from './SignedInUser'

export function PhoneTopBar({ userName, onSignOut }: ShellUserProps) {
    return (
        <Flex
            as="header"
            align="center"
            gap="2"
            minH="14"
            pl="1.5"
            pr="2"
            bg="bg"
            borderBottomWidth="1px"
            borderColor="border"
        >
            <MenuDrawer
                width="19rem"
                hasCloseButton
                trigger={
                    <IconButton aria-label={hr.shell.openMenu} variant="ghost" size="lg">
                        <Menu />
                    </IconButton>
                }
                footer={
                    <Stack gap="3" p="1">
                        <Stack gap="1">
                            <CityName />
                            <SignedInUser name={userName} />
                        </Stack>
                        <Button variant="outline" size="xl" onClick={onSignOut}>
                            <LogOut aria-hidden="true" />
                            {hr.shell.signOut}
                        </Button>
                    </Stack>
                }
            />

            <CityName />
        </Flex>
    )
}
