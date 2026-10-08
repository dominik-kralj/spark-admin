import { Button, Flex, HStack } from '@chakra-ui/react'
import { LogOut } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

import { CityName } from './CityName'
import { SignedInUser } from './SignedInUser'

export interface ShellUserProps {
    userName: string
    onSignOut: () => void
}

export function ShellHeader({ userName, onSignOut }: ShellUserProps) {
    const t = useStrings()

    return (
        <Flex
            as="header"
            minH="16"
            wrap="wrap"
            align="center"
            justify="space-between"
            gap="2 4"
            py="2.5"
            px={{ base: '6', lg: '8' }}
            bg="bg"
            borderBottomWidth="1px"
            borderColor="border"
        >
            <CityName />

            <HStack gap="4">
                <SignedInUser name={userName} />

                <Button variant="outline" size="sm" onClick={onSignOut}>
                    <LogOut aria-hidden="true" />
                    {t.shell.signOut}
                </Button>
            </HStack>
        </Flex>
    )
}
