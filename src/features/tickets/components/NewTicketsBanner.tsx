import { Button, Flex, Text } from '@chakra-ui/react'
import { ArrowDown } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useAnnouncement } from '@/shared/lib/useAnnouncement'

import { useNewestTicketTime, useNewTicketCount } from '../api/useTickets'
import type { TicketFilters } from '../validators/ticket'

interface NewTicketsNoticeProps {
    count: number
    onShow: () => void
}

function NewTicketsNotice({ count, onShow }: NewTicketsNoticeProps) {
    const t = useStrings()
    const strings = t.tickets.newTickets
    // Through the shell's live region: a region that mounts with its text is often not read.
    useAnnouncement(strings.count(count))

    return (
        <Flex
            wrap={{ md: 'wrap' }}
            align="center"
            justify="space-between"
            columnGap="4"
            rowGap="2"
            py={{ base: '1', lg: '2' }}
            pl={{ base: '3', md: '4' }}
            pr={{ base: '1', lg: '2' }}
            bg="blue.subtle"
            borderWidth="1px"
            borderColor="blue.solid"
            borderRadius="lg"
            color="blue.fg"
        >
            <Flex align="center" gap="2" fontWeight="medium">
                <ArrowDown size="16" aria-hidden="true" />
                <Text hideBelow="md">{strings.count(count)}</Text>
                <Text hideFrom="md">{strings.countShort(count)}</Text>
            </Flex>

            <Button
                size={{ base: 'sm', lg: 'xs' }}
                variant="outline"
                colorPalette="blue"
                bg="bg"
                // One name at every width; the phone's shorter text is part of it.
                aria-label={strings.show}
                onClick={onShow}
            >
                <Text as="span" hideBelow="md">
                    {strings.show}
                </Text>
                <Text as="span" hideFrom="md">
                    {strings.showShort}
                </Text>
            </Button>
        </Flex>
    )
}

interface NewTicketsBannerProps {
    filters: TicketFilters
    onShow: () => void
}

/** Counts tickets newer than the loaded ones; the rows only change when the user asks. */
export function NewTicketsBanner({ filters, onShow }: NewTicketsBannerProps) {
    const newest = useNewestTicketTime(filters)
    const newCount = useNewTicketCount({ createdAfter: newest.data ?? null, filters })
    const count = newCount.data ?? 0

    if (count === 0) return null

    return <NewTicketsNotice count={count} onShow={onShow} />
}
