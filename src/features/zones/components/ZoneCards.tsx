import { Box, Grid, Stack, Text } from '@chakra-ui/react'

import { hr } from '@/shared/i18n/hr'
import { formatAmount, formatMinutes } from '@/shared/lib/format'

import type { Zone } from '../validators/zone'

const { columns } = hr.zones

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
                        <Box>
                            <Text as="dt" fontSize="caption" color="fg.muted">
                                {columns.price}
                            </Text>
                            <Text as="dd" whiteSpace="nowrap">
                                {formatAmount(zone.price)}
                            </Text>
                        </Box>
                        <Box>
                            <Text as="dt" fontSize="caption" color="fg.muted">
                                {columns.dailyTicketPrice}
                            </Text>
                            <Text as="dd" whiteSpace="nowrap">
                                {formatAmount(zone.dailyTicketPrice)}
                            </Text>
                        </Box>
                        <Box>
                            <Text as="dt" fontSize="caption" color="fg.muted">
                                {columns.durationMinutes}
                            </Text>
                            <Text as="dd" whiteSpace="nowrap">
                                {formatMinutes(zone.durationMinutes)}
                            </Text>
                        </Box>
                    </Grid>
                </Stack>
            ))}
        </Stack>
    )
}
