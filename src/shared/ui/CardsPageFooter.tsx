import { Flex, Text } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'

import { ListPagination } from './ListPagination'
import type { PageFooterProps } from './TablePageFooter'

/** Under a phone's cards: the short range and the arrows. */
export function CardsPageFooter({ range, page, onPageChange }: PageFooterProps) {
    const t = useStrings()

    return (
        <Flex wrap="wrap" justify="space-between" align="center" gap="3">
            <Text textStyle="sm" color="fg.muted">
                {t.pagination.shownShort(range.from, range.to, range.total)}
            </Text>
            <ListPagination
                label={t.pagination.listLabel}
                page={page}
                pageSize={range.pageSize}
                totalCount={range.total}
                onPageChange={onPageChange}
            />
        </Flex>
    )
}
