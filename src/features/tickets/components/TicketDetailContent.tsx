import { Box, Flex, Grid, Heading, Separator, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'
import { formatAmount, formatDateTime, formatMinutes, formatPercent } from '@/shared/lib/format'
import { ProcessingStatusChip } from '@/shared/ui/ProcessingStatusChip'

import type { TicketDetail } from '../validators/ticket'

import { CopyButton } from './CopyButton'
import { MissingValue } from './MissingValue'

type Strings = Dictionary['tickets']['detail']

interface Field {
    label: string
    value: ReactNode
}

function orMissing<T>(value: T | null, format: (value: T) => string): ReactNode {
    return value === null ? <MissingValue /> : format(value)
}

function ticketFields(ticket: TicketDetail, fields: Strings['fields']): Field[] {
    return [
        { label: fields.plate, value: <Text textStyle="plate">{ticket.plate}</Text> },
        { label: fields.zone, value: ticket.zone.code },
        { label: fields.createdAt, value: formatDateTime(ticket.createdAt) },
        { label: fields.validUntil, value: formatDateTime(ticket.validUntil) },
        { label: fields.duration, value: formatMinutes(ticket.parkingMinutes) },
        { label: fields.amount, value: formatAmount(ticket.amount) },
        { label: fields.vatBase, value: orMissing(ticket.vat.base, formatAmount) },
        { label: fields.vatRate, value: orMissing(ticket.vat.rate, formatPercent) },
        { label: fields.vatAmount, value: orMissing(ticket.vat.amount, formatAmount) },
    ]
}

function CopyableValue({ value, copyLabel }: { value: string | null; copyLabel: string }) {
    if (value === null) return <MissingValue />

    return (
        <Flex justify="space-between" align="center" gap="3">
            <Text fontFamily="mono" wordBreak="break-all">
                {value}
            </Text>
            <CopyButton value={value} label={copyLabel} />
        </Flex>
    )
}

function transactionFields(ticket: TicketDetail, strings: Strings): Field[] {
    const { fiscal } = ticket
    const fields: Field[] = [
        {
            label: strings.fields.transactionId,
            value: (
                <CopyableValue
                    value={ticket.transactionId}
                    copyLabel={strings.copy.transactionId}
                />
            ),
        },
        {
            label: strings.fields.jir,
            value: <CopyableValue value={fiscal.jir} copyLabel={strings.copy.jir} />,
        },
        {
            label: strings.fields.zki,
            value: <CopyableValue value={fiscal.zki} copyLabel={strings.copy.zki} />,
        },
        {
            label: strings.fields.fiscalizedAt,
            value: orMissing(fiscal.fiscalizedAt, formatDateTime),
        },
    ]

    if (fiscal.lastError === null) return fields

    return [...fields, { label: strings.fields.fiscalError, value: fiscal.lastError }]
}

function FieldTerm({ children }: { children: string }) {
    return (
        <Text as="dt" fontSize="caption" color="fg.muted">
            {children}
        </Text>
    )
}

export function TicketDetailContent({ ticket }: { ticket: TicketDetail }) {
    const t = useStrings()
    const strings = t.tickets.detail

    return (
        <Stack gap="6">
            <Grid
                as="dl"
                templateColumns="repeat(2, minmax(0, 1fr))"
                gap="3"
                p="4"
                bg="bg.subtle"
                borderRadius="md"
            >
                <Box>
                    <FieldTerm>{t.tickets.columns.payment}</FieldTerm>
                    <Box as="dd" mt="1">
                        <ProcessingStatusChip stage="payment" status={ticket.payment.status} />
                    </Box>
                </Box>
                <Box>
                    <FieldTerm>{t.tickets.columns.fiscal}</FieldTerm>
                    <Box as="dd" mt="1">
                        <ProcessingStatusChip stage="fiscal" status={ticket.fiscal.status} />
                    </Box>
                </Box>
            </Grid>

            <Stack gap="4">
                <Heading as="h3" textStyle="md" color="spark.heading">
                    {strings.ticketSection}
                </Heading>
                <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" columnGap="4" rowGap="4">
                    {ticketFields(ticket, strings.fields).map(({ label, value }) => (
                        <Box key={label}>
                            <FieldTerm>{label}</FieldTerm>
                            <Box as="dd">{value}</Box>
                        </Box>
                    ))}
                </Grid>
            </Stack>

            <Separator />

            <Stack gap="2">
                <Heading as="h3" textStyle="md" color="spark.heading">
                    {strings.transactionSection}
                </Heading>
                <Stack as="dl" gap="0">
                    {transactionFields(ticket, strings).map(({ label, value }) => (
                        <Box
                            key={label}
                            py="2.5"
                            borderBottomWidth="1px"
                            _last={{ borderBottomWidth: '0' }}
                        >
                            <FieldTerm>{label}</FieldTerm>
                            <Box as="dd">{value}</Box>
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Stack>
    )
}
