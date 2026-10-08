import { Box, Button, Flex, Grid, Stack, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

import { validityOf } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { ValidUntilText } from './ValidUntilText'
import { ValidityChip } from './ValidityChip'

interface PrivilegedOwnerCardsProps {
    owners: PrivilegedOwner[]
    now: Date
    onEdit: (owner: PrivilegedOwner) => void
}

export function PrivilegedOwnerCards({ owners, now, onEdit }: PrivilegedOwnerCardsProps) {
    const t = useStrings()
    const { columns } = t.privilegedOwners

    return (
        <Stack
            as="ul"
            hideFrom="md"
            aria-label={t.privilegedOwners.listLabel}
            gap="2"
            listStyleType="none"
        >
            {owners.map((owner) => {
                const validity = validityOf(owner, now)

                return (
                    <Stack
                        as="li"
                        key={owner.id}
                        layerStyle="panel"
                        bg={validity === 'expired' ? 'bg.subtle' : undefined}
                        gap="3"
                        p="4"
                    >
                        <Flex justify="space-between" align="center" gap="3">
                            <Text
                                fontFamily="mono"
                                fontSize="1.0625rem"
                                fontWeight="semibold"
                                color="spark.heading"
                            >
                                {owner.plate}
                            </Text>
                            <Button
                                aria-label={t.privilegedOwners.editOwner(owner.plate)}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onEdit(owner)
                                }}
                            >
                                <Pencil aria-hidden="true" />
                                {t.privilegedOwners.edit}
                            </Button>
                        </Flex>

                        <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap="3">
                            <Box>
                                <Text as="dt" fontSize="caption" color="fg.muted">
                                    {columns.validUntil}
                                </Text>
                                <ValidUntilText as="dd" owner={owner} validity={validity} />
                            </Box>
                            <Box>
                                <Text as="dt" fontSize="caption" color="fg.muted">
                                    {columns.status}
                                </Text>
                                <Box as="dd">
                                    <ValidityChip validity={validity} />
                                </Box>
                            </Box>
                            <Box gridColumn="1 / -1">
                                <Text as="dt" fontSize="caption" color="fg.muted">
                                    {columns.ownerName}
                                </Text>
                                <Text as="dd">{owner.ownerName}</Text>
                            </Box>
                        </Grid>
                    </Stack>
                )
            })}
        </Stack>
    )
}
