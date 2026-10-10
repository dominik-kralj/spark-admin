import { Stack } from '@chakra-ui/react'

import type { Dictionary } from '@/shared/i18n/dictionary'
import { useStrings } from '@/shared/i18n/useStrings'
import type { PageRange } from '@/shared/lib/pageRange'
import { visibleRowLink } from '@/shared/lib/visibleRowLink'
import { paths } from '@/shared/paths'
import { CardDetailLink } from '@/shared/ui/CardDetailLink'
import { CardFields } from '@/shared/ui/CardFields'
import { CardsPageFooter } from '@/shared/ui/CardsPageFooter'
import type { DetailField } from '@/shared/ui/DetailFields'
import { MissingValue } from '@/shared/ui/MissingValue'

import { canFiscalizeAgain } from '../lib/fiscalizeRequest'
import type { DailyTicket } from '../validators/dailyTicket'

import { DailyTicketFiscalChip } from './DailyTicketFiscalChip'
import { FiscalizeAgainButton } from './FiscalizeAgainButton'

function cardFields(
    dailyTicket: DailyTicket,
    columns: Dictionary['dailyTickets']['columns'],
): DetailField[] {
    return [
        { label: columns.zone, value: dailyTicket.zone.code },
        {
            label: columns.fiscal,
            value: <DailyTicketFiscalChip id={dailyTicket.id} status={dailyTicket.fiscal.status} />,
        },
        { label: columns.address, value: dailyTicket.address ?? <MissingValue /> },
    ]
}

interface DailyTicketCardsProps {
    dailyTickets: DailyTicket[]
    range: PageRange
    isUpdating: boolean
    page: number
    onPageChange: (page: number) => void
}

// The card is not one link, so the plate link and the retry button stay separate targets.
export function DailyTicketCards({
    dailyTickets,
    range,
    isUpdating,
    page,
    onPageChange,
}: DailyTicketCardsProps) {
    const t = useStrings()

    return (
        <Stack hideFrom="md" gap="3">
            <Stack
                as="ul"
                aria-label={t.dailyTickets.listLabel}
                aria-busy={isUpdating}
                gap="2"
                listStyleType="none"
            >
                {dailyTickets.map((dailyTicket) => (
                    <Stack as="li" key={dailyTicket.id} layerStyle="panel" gap="2" px="4" pb="4">
                        <CardDetailLink
                            listPath={paths.dailyTickets}
                            id={dailyTicket.id}
                            plate={dailyTicket.plate}
                        />
                        <CardFields fields={cardFields(dailyTicket, t.dailyTickets.columns)} />

                        {canFiscalizeAgain(dailyTicket) && (
                            <FiscalizeAgainButton
                                ticket={dailyTicket}
                                fallbackFocus={() => visibleRowLink(dailyTicket.id)}
                                variant="outline"
                                w="full"
                                mt="1"
                            />
                        )}
                    </Stack>
                ))}
            </Stack>

            <CardsPageFooter range={range} page={page} onPageChange={onPageChange} />
        </Stack>
    )
}
