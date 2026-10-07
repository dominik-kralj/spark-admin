import { Button, Flex, HStack, Skeleton, Span } from '@chakra-ui/react'
import { Landmark, LogOut, User } from 'lucide-react'

import { hr } from '@/shared/i18n/hr'

import { useCityName } from '../api/useCityName'

export interface ShellHeaderProps {
    userName: string
    onSignOut: () => void
}

export function ShellHeader({ userName, onSignOut }: ShellHeaderProps) {
    const cityName = useCityName()

    return (
        <Flex
            as="header"
            minH="16"
            wrap="wrap"
            align="center"
            justify="space-between"
            gap="2 4"
            py="2.5"
            px="8"
            bg="bg"
            borderBottomWidth="1px"
            borderColor="border"
        >
            <HStack gap="2" color="spark.heading" fontWeight="semibold">
                {cityName.isPending && <Skeleton h="5" w="32" />}
                {cityName.isSuccess && (
                    <>
                        <Landmark size="18" aria-hidden="true" />
                        <Span>{cityName.data}</Span>
                    </>
                )}
            </HStack>

            <HStack gap="4">
                <HStack gap="2" color="gray.fg">
                    <User size="18" aria-hidden="true" />
                    <Span>{userName}</Span>
                </HStack>

                <Button variant="outline" onClick={onSignOut}>
                    <LogOut aria-hidden="true" />
                    {hr.shell.signOut}
                </Button>
            </HStack>
        </Flex>
    )
}
