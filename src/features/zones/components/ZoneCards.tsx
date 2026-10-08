import { Box, Button, Grid, Stack, Text } from '@chakra-ui/react'
import { Pencil } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { Dictionary } from '@/shared/i18n/dictionary'
import { formatAmount, formatMinutes } from '@/shared/lib/format'

import type { Zone } from '../validators/zone'

function cardFields(zone: Zone, columns: Dictionary['zones']['columns']) {
    return [
        { label: columns.price, value: formatAmount(zone.price) },
        { label: columns.dailyTicketPrice, value: formatAmount(zone.dailyTicketPrice) },
        { label: columns.durationMinutes, value: formatMinutes(zone.durationMinutes) },
    ]
}

interface ZoneCardsProps {
    zones: Zone[]
    onEdit: (zone: Zone) => void
}

export function ZoneCards({ zones, onEdit }: ZoneCardsProps) {
    const t = useStrings()

    return (
        <Stack as="ul" hideFrom="md" aria-label={t.zones.listLabel} gap="2" listStyleType="none">
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
                        {cardFields(zone, t.zones.columns).map(({ label, value }) => (
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

                    <Button
                        aria-label={t.zones.editZone(zone.code)}
                        variant="outline"
                        onClick={() => {
                            onEdit(zone)
                        }}
                    >
                        <Pencil />
                        {t.zones.edit}
                    </Button>
                </Stack>
            ))}
        </Stack>
    )
}
