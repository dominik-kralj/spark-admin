import { Box, Table } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'

import { formatReportValue } from '../lib/formatReportValue'
import type { ReportColumn, ReportPreview, ReportValue } from '../validators/report'

// Numbers line up on the right; words and dates read from the left.
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
        <Box hideBelow="md" mt="4">
            {/* Focusable, so a keyboard can scroll it sideways when a report is wider than the page. */}
            <Table.ScrollArea
                tabIndex={0}
                role="region"
                aria-label={strings.scrollRegion}
                borderWidth="1px"
                borderRadius="md"
            >
                <Table.Root aria-label={strings.tableLabel} whiteSpace="nowrap">
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
        </Box>
    )
}
