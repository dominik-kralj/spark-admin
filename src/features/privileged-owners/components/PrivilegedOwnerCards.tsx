import { Box, Button, Flex, Grid, Stack, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'

import { expiredTint } from '../lib/expiredTint'
import type { PrivilegedOwnerRow } from '../lib/validity'
import type { PrivilegedOwner } from '../validators/privilegedOwner'

import { ValidUntilText } from './ValidUntilText'
import { ValidityChip } from './ValidityChip'

function cardFields(
    { owner, validity }: PrivilegedOwnerRow,
    columns: Dictionary['privilegedOwners']['columns'],
): { label: string; value: ReactNode; isWide?: boolean }[] {
    return [
        {
            label: columns.validUntil,
            value: <ValidUntilText validUntil={owner.validUntil} validity={validity} />,
        },
        { label: columns.status, value: <ValidityChip validity={validity} /> },
        { label: columns.ownerName, value: owner.ownerName, isWide: true },
    ]
}

interface PrivilegedOwnerCardsProps {
    rows: PrivilegedOwnerRow[]
    onEdit: (owner: PrivilegedOwner) => void
}

export function PrivilegedOwnerCards({ rows, onEdit }: PrivilegedOwnerCardsProps) {
    const t = useStrings()

    return (
        <Stack
            as="ul"
            hideFrom="md"
            aria-label={t.privilegedOwners.listLabel}
            gap="2"
            listStyleType="none"
        >
            {rows.map((row) => (
                <Stack
                    as="li"
                    key={row.owner.id}
                    layerStyle="panel"
                    bg={expiredTint(row.validity)}
                    gap="3"
                    p="4"
                >
                    <Flex justify="space-between" align="center" gap="3">
                        <Text textStyle="plate" fontSize="1.0625rem" color="spark.heading">
                            {row.owner.plate}
                        </Text>
                        <Button
                            aria-label={t.privilegedOwners.editOwner(row.owner.plate)}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onEdit(row.owner)
                            }}
                        >
                            <Pencil aria-hidden="true" />
                            {t.privilegedOwners.edit}
                        </Button>
                    </Flex>

                    <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap="3">
                        {cardFields(row, t.privilegedOwners.columns).map(
                            ({ label, value, isWide }) => (
                                <Box key={label} gridColumn={isWide ? '1 / -1' : undefined}>
                                    <Text as="dt" fontSize="caption" color="fg.muted">
                                        {label}
                                    </Text>
                                    <Box as="dd">{value}</Box>
                                </Box>
                            ),
                        )}
                    </Grid>
                </Stack>
            ))}
        </Stack>
    )
}
