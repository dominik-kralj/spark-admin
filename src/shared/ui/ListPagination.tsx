import { ButtonGroup, IconButton, Pagination, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

interface ListPaginationProps {
    label: string
    page: number
    pageSize: number
    totalCount: number
    onPageChange: (page: number) => void
    /** From lg the table footer has room for page numbers; below it, "Stranica 1 od 13". */
    hasPageNumbers?: boolean
}

export function ListPagination({
    label,
    page,
    pageSize,
    totalCount,
    onPageChange,
    hasPageNumbers = false,
}: ListPaginationProps) {
    const t = useStrings()
    const pageCount = Math.ceil(totalCount / pageSize)

    return (
        <Pagination.Root
            count={totalCount}
            pageSize={pageSize}
            page={page}
            onPageChange={(details) => {
                onPageChange(details.page)
            }}
            translations={{
                rootLabel: label,
                prevTriggerLabel: t.pagination.previous,
                nextTriggerLabel: t.pagination.next,
                itemLabel: ({ page: itemPage }) => t.pagination.page(itemPage),
            }}
        >
            <ButtonGroup variant="outline" size="sm" gap="2">
                <Pagination.PrevTrigger asChild>
                    <IconButton>
                        <ChevronLeft aria-hidden="true" />
                    </IconButton>
                </Pagination.PrevTrigger>

                {hasPageNumbers && (
                    <ButtonGroup hideBelow="lg" variant="ghost" size="sm" gap="1">
                        <Pagination.Items
                            render={(item) => (
                                <IconButton
                                    variant={{ base: 'ghost', _selected: 'solid' }}
                                    colorPalette={{ _selected: 'gray' }}
                                >
                                    {item.value}
                                </IconButton>
                            )}
                        />
                    </ButtonGroup>
                )}
                {hasPageNumbers && (
                    <Text hideFrom="lg" px="1" textStyle="sm" color="fg">
                        {t.pagination.pageOfTotal(page, pageCount)}
                    </Text>
                )}

                <Pagination.NextTrigger asChild>
                    <IconButton>
                        <ChevronRight aria-hidden="true" />
                    </IconButton>
                </Pagination.NextTrigger>
            </ButtonGroup>
        </Pagination.Root>
    )
}
