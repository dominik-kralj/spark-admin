import { Box, Grid, Stack, Text } from '@chakra-ui/react'

import { hr } from '@/shared/i18n/hr'
import { formatAmount, formatMinutes } from '@/shared/lib/format'

import type { Zone } from '../validators/zone'

const { columns } = hr.zones

function cardFields(zone: Zone) {
    return [
        { label: columns.price, value: formatAmount(zone.price) },
        { label: columns.dailyTicketPrice, value: formatAmount(zone.dailyTicketPrice) },
        { label: columns.durationMinutes, value: formatMinutes(zone.durationMinutes) },
    ]
}

export function ZoneCards({ zones }: { zones: Zone[] }) {
    return (
        <Stack as="ul" hideFrom="md" aria-label={hr.zones.listLabel} gap="2" listStyleType="none">
            {zones.map((zone) => (
                <Stack as="li" key={zone.id} layerStyle="panel" gap="3" p="4">
                    <Box>
                        <Text
                            fontSize="1.0625rem"
                            lineHeight="1.5rem"
                            fontWeight="semibold"
                            color="spark.heading"
                        >
                            {zone.code}
                        </Text>
                        <Text textStyle="sm" color="fg.muted">
                            {zone.name}
                        </Text>
                    </Box>

                    <Grid as="dl" templateColumns="repeat(3, minmax(0, 1fr))" gap="3">
                        {cardFields(zone).map(({ label, value }) => (
                            <Box key={label}>
                                <Text as="dt" fontSize="caption" color="fg.muted">
                                    {label}
                                </Text>
                                <Text as="dd" whiteSpace="nowrap">
                                    {value}
                                </Text>
                            </Box>
                        ))}
                    </Grid>
                </Stack>
            ))}
        </Stack>
    )
}
