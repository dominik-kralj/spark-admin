import { Text } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { PageRange } from '@/shared/lib/pageRange'

import { ListPagination } from './ListPagination'

export interface PageFooterProps {
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
