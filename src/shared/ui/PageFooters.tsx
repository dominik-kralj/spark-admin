import { Flex, Text } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { PageRange } from '@/shared/lib/pageRange'

import { ListPagination } from './ListPagination'

interface PageFooterProps {
    range: PageRange
    page: number
    onPageChange: (page: number) => void
}

/** A paged table's footer: "Prikazano 1–25 od 300" and the pages. */
export function TablePageFooter({ range, page, onPageChange }: PageFooterProps) {
    const t = useStrings()

    return (
        <>
            <Text>{t.pagination.shown(range.from, range.to, range.total)}</Text>
            <ListPagination
                label={t.pagination.tableLabel}
                page={page}
                pageSize={range.pageSize}
                totalCount={range.total}
                onPageChange={onPageChange}
                hasPageNumbers
            />
        </>
    )
}

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
