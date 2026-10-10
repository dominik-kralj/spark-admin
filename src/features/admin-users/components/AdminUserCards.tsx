import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { fullName } from '@/shared/lib/fullName'

import type { AdminUser } from '../validators/adminUser'

import { YouChip } from './YouChip'

interface AdminUserCardsProps {
    users: AdminUser[]
    signedInUserId: number | null
    onEdit: (user: AdminUser) => void
}

export function AdminUserCards({ users, signedInUserId, onEdit }: AdminUserCardsProps) {
    const t = useStrings()

    return (
        <Stack
            as="ul"
            hideFrom="md"
            aria-label={t.adminUsers.listLabel}
            gap="2"
            listStyleType="none"
        >
            {users.map((user) => (
                <Stack as="li" key={user.id} layerStyle="panel" gap="2" p="4">
                    <Flex justify="space-between" align="center" gap="3">
                        <Text
                            fontSize="1.0625rem"
                            lineHeight="1.5rem"
                            fontWeight="semibold"
                            color="spark.heading"
                            minW="0"
                            overflowWrap="anywhere"
                        >
                            {user.username}
                        </Text>
                        <Button
                            aria-label={t.adminUsers.editAdminUser(user.username)}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onEdit(user)
                            }}
                        >
                            <Pencil aria-hidden="true" />
                            {t.adminUsers.edit}
                        </Button>
                    </Flex>

                    <HStack gap="2">
                        <Text>{fullName(user)}</Text>
                        {user.id === signedInUserId && <YouChip />}
                    </HStack>
                </Stack>
            ))}
        </Stack>
    )
}
