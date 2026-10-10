import { Alert, Heading, Separator, Stack, Text } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'
import type { RefObject } from 'react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'
import { formatAmount, formatDateTime } from '@/shared/lib/format'
import { DetailFields, type DetailField } from '@/shared/ui/DetailFields'
import { MissingValue } from '@/shared/ui/MissingValue'

import { canFiscalizeAgain } from '../lib/fiscalizeRequest'
import type { DailyTicketDetail } from '../validators/dailyTicket'

import { DailyTicketFiscalChip } from './DailyTicketFiscalChip'
import { FiscalizeAgainButton } from './FiscalizeAgainButton'
import { VehiclePhotos } from './VehiclePhotos'

type Strings = Dictionary['dailyTickets']['detail']

function ticketFields(dailyTicket: DailyTicketDetail, fields: Strings['fields']): DetailField[] {
    return [
        {
            label: fields.plate,
            value: (
                <Text textStyle="plate" fontWeight="semibold">
                    {dailyTicket.plate}
                </Text>
            ),
        },
        { label: fields.zone, value: dailyTicket.zone.code },
        { label: fields.createdAt, value: formatDateTime(dailyTicket.createdAt) },
        { label: fields.amount, value: formatAmount(dailyTicket.amount) },
        { label: fields.address, value: dailyTicket.address ?? <MissingValue /> },
        { label: fields.inspector, value: dailyTicket.inspector.name },
    ]
}

function fiscalFields(dailyTicket: DailyTicketDetail, strings: Strings): DetailField[] {
    const { fiscal } = dailyTicket

    return [
        {
            label: strings.fields.status,
            value: <DailyTicketFiscalChip id={dailyTicket.id} status={fiscal.status} />,
        },
        { label: strings.fields.jir, value: fiscal.jir ?? strings.jirMissing },
        {
            label: strings.fields.zki,
            value:
                fiscal.zki === null ? (
                    <MissingValue />
                ) : (
                    <Text fontFamily="mono" wordBreak="break-all">
                        {fiscal.zki}
                    </Text>
                ),
        },
    ]
}

interface FailureNoticeProps {
    dailyTicket: DailyTicketDetail
    titleRef: RefObject<HTMLHeadingElement | null>
}

// First in the detail: what failed and the way to retry come before the data.
function FailureNotice({ dailyTicket, titleRef }: FailureNoticeProps) {
    const t = useStrings()
    const { failure } = t.dailyTickets.detail

    return (
        <Alert.Root status="error" alignItems="flex-start">
            <Alert.Indicator>
                <CircleAlert />
            </Alert.Indicator>
            <Alert.Content gap="3">
                <Alert.Description>
                    <strong>{failure.title}</strong> {failure.description}{' '}
                    {dailyTicket.fiscal.lastError !== null &&
                        `${failure.response(dailyTicket.fiscal.lastError)} `}
                    {failure.advice}
                </Alert.Description>
                <FiscalizeAgainButton
                    ticket={dailyTicket}
                    fallbackFocus={() => titleRef.current}
                    colorPalette="blue"
                    alignSelf={{ base: 'stretch', md: 'flex-start' }}
                />
            </Alert.Content>
        </Alert.Root>
    )
}

function SectionHeading({ children }: { children: string }) {
    return (
        <Heading as="h3" textStyle="md" color="spark.heading">
            {children}
        </Heading>
    )
}

interface DailyTicketDetailContentProps {
    dailyTicket: DailyTicketDetail
    titleRef: RefObject<HTMLHeadingElement | null>
}

export function DailyTicketDetailContent({ dailyTicket, titleRef }: DailyTicketDetailContentProps) {
    const t = useStrings()
    const strings = t.dailyTickets.detail

    return (
        <Stack gap="6">
            {canFiscalizeAgain(dailyTicket) && (
                <FailureNotice dailyTicket={dailyTicket} titleRef={titleRef} />
            )}

            <Stack gap="4">
                <SectionHeading>{strings.ticketSection}</SectionHeading>
                <DetailFields fields={ticketFields(dailyTicket, strings.fields)} />
            </Stack>

            <Separator />

            <Stack gap="3">
                <SectionHeading>{strings.photosSection(dailyTicket.photos.length)}</SectionHeading>
                <VehiclePhotos plate={dailyTicket.plate} photos={dailyTicket.photos} />
            </Stack>

            <Separator />

            <Stack gap="4">
                <SectionHeading>{strings.fiscalSection}</SectionHeading>
                <DetailFields fields={fiscalFields(dailyTicket, strings)} />
            </Stack>
        </Stack>
    )
}
