import { Box, Button, Flex, Grid, Stack, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'
import type { ReactNode } from 'react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'
import { fullName } from '@/shared/lib/fullName'

import { inactiveTint } from '../lib/inactiveTint'
import type { Inspector } from '../validators/inspector'

import { InspectorDeleteButton } from './InspectorDeleteButton'
import { InspectorStatusChip } from './InspectorStatusChip'

function cardFields(
    inspector: Inspector,
    columns: Dictionary['inspectors']['columns'],
): { label: string; value: ReactNode }[] {
    return [
        { label: columns.oib, value: <Text fontFamily="mono">{inspector.oib}</Text> },
        { label: columns.status, value: <InspectorStatusChip isActive={inspector.isActive} /> },
    ]
}

interface InspectorCardsProps {
    inspectors: Inspector[]
    onEdit: (inspector: Inspector) => void
    onDelete: (inspector: Inspector) => void
}

export function InspectorCards({ inspectors, onEdit, onDelete }: InspectorCardsProps) {
    const t = useStrings()

    return (
        <Stack
            as="ul"
            hideFrom="md"
            aria-label={t.inspectors.listLabel}
            gap="2"
            listStyleType="none"
        >
            {inspectors.map((inspector) => {
                const name = fullName(inspector)

                return (
                    <Stack
                        as="li"
                        key={inspector.id}
                        layerStyle="panel"
                        bg={inactiveTint(inspector.isActive)}
                        gap="3"
                        p="4"
                    >
                        <Flex justify="space-between" align="center" gap="3">
                            <Text
                                fontSize="1.0625rem"
                                lineHeight="1.5rem"
                                fontWeight="semibold"
                                color="spark.heading"
                            >
                                {name}
                            </Text>
                            <Button
                                aria-label={t.inspectors.editInspector(name)}
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onEdit(inspector)
                                }}
                            >
                                <Pencil aria-hidden="true" />
                                {t.inspectors.edit}
                            </Button>
                        </Flex>

                        <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap="3">
                            {cardFields(inspector, t.inspectors.columns).map(({ label, value }) => (
                                <Box key={label}>
                                    <Text as="dt" fontSize="caption" color="fg.muted">
                                        {label}
                                    </Text>
                                    <Box as="dd">{value}</Box>
                                </Box>
                            ))}
                        </Grid>

                        <InspectorDeleteButton
                            inspector={inspector}
                            onDelete={onDelete}
                            placement="card"
                        />
                    </Stack>
                )
            })}
        </Stack>
    )
}
