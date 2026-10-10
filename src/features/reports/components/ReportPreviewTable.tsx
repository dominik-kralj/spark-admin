import { Flex, Table } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'

import { formatReportValue } from '../lib/formatReportValue'
import type { ReportColumn, ReportPreview, ReportValue } from '../validators/report'

function alignOf({ type }: ReportColumn) {
    return type === 'count' || type === 'amount' ? 'end' : 'start'
}

function valueAt(values: ReportValue[], index: number): ReportValue {
    return values[index] ?? null
}

/** The preview from md: a read-only table; its rows never change, so their positions are their keys. */
export function ReportPreviewTable({ preview }: { preview: ReportPreview }) {
    const t = useStrings()
    const strings = t.reports.preview
    const { columns, rows, totals } = preview

    return (
        <Flex
            hideBelow="md"
            direction="column"
            minH="0"
            mt="4"
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
        >
            {/* Focusable, so a keyboard can scroll the rows it holds back. */}
            <Table.ScrollArea
                tabIndex={0}
                role="region"
                aria-label={strings.scrollRegion}
                flex="1"
                minH="0"
                overflowY="auto"
            >
                <Table.Root aria-label={strings.tableLabel} whiteSpace="nowrap" stickyHeader>
                    <Table.Header>
                        <Table.Row>
                            {columns.map((column, index) => (
                                <Table.ColumnHeader key={index} textAlign={alignOf(column)}>
                                    {column.label}
                                </Table.ColumnHeader>
                            ))}
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {rows.map((row, rowIndex) => (
                            <Table.Row key={rowIndex}>
                                {columns.map((column, index) => (
                                    <Table.Cell key={index} textAlign={alignOf(column)}>
                                        {formatReportValue(valueAt(row, index), column.type)}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        ))}

                        {totals !== null && (
                            <Table.Row bg="bg.subtle" fontWeight="semibold">
                                <Table.Cell as="th" scope="row">
                                    {strings.total}
                                </Table.Cell>
                                {columns.slice(1).map((column, index) => (
                                    <Table.Cell key={index} textAlign={alignOf(column)}>
                                        {formatReportValue(valueAt(totals, index + 1), column.type)}
                                    </Table.Cell>
                                ))}
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table.Root>
            </Table.ScrollArea>
        </Flex>
    )
}
