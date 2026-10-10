import { Stack, Text } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'
import { CardFields } from '@/shared/ui/CardFields'

import { formatReportValue } from '../lib/formatReportValue'
import type { ReportColumn, ReportPreview, ReportValue } from '../validators/report'

// A field with no value (a total of words) is left out, not shown empty.
function cardFields(columns: ReportColumn[], values: ReportValue[]) {
    return columns
        .slice(1)
        .map((column, index) => ({
            label: column.label,
            value: formatReportValue(values[index + 1] ?? null, column.type),
        }))
        .filter(({ value }) => value !== '')
}

/**
 * The phone layout of the preview: a card per row, titled by its first column, and the
 * total last. Rows never change, so their positions are their keys.
 */
export function ReportPreviewCards({ preview }: { preview: ReportPreview }) {
    const t = useStrings()
    const { columns, rows, totals } = preview
    const [firstColumn] = columns

    return (
        <Stack
            as="ul"
            hideFrom="md"
            aria-label={t.reports.preview.tableLabel}
            mt="4"
            gap="2"
            listStyleType="none"
        >
            {rows.map((row, rowIndex) => (
                <Stack as="li" key={rowIndex} layerStyle="panel" gap="2" p="4">
                    <Text fontWeight="semibold" color="spark.heading">
                        {firstColumn && formatReportValue(row[0] ?? null, firstColumn.type)}
                    </Text>
                    <CardFields fields={cardFields(columns, row)} />
                </Stack>
            ))}

            {totals !== null && (
                <Stack as="li" layerStyle="panel" bg="bg.subtle" gap="2" p="4">
                    <Text fontWeight="semibold" color="spark.heading">
                        {t.reports.preview.total}
                    </Text>
                    <CardFields fields={cardFields(columns, totals)} />
                </Stack>
            )}
        </Stack>
    )
}
