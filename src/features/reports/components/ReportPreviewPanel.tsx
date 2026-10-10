import { Box, Grid, Heading, Text } from '@chakra-ui/react'
import { useId } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { formatCalendarDate } from '@/shared/lib/format'
import { useZoneOptions } from '@/shared/lib/useZoneOptions'

import { useReportRecipient } from '../api/useReports'
import type { ReportPreview } from '../validators/report'
import type { ReportParams } from '../validators/reportForm'

import { ReportExportActions } from './ReportExportActions'
import { ReportPreviewCards } from './ReportPreviewCards'
import { ReportPreviewTable } from './ReportPreviewTable'

interface ReportPreviewPanelProps {
    params: ReportParams
    reportName: string
    preview: ReportPreview
}

// On a phone the actions follow the table; from md they sit beside the heading.
const areas = { base: '"header" "paper" "actions"', md: '"header actions" "paper paper"' }

export function ReportPreviewPanel({ params, reportName, preview }: ReportPreviewPanelProps) {
    const t = useStrings()
    const strings = t.reports.preview
    const headingId = useId()
    const recipient = useReportRecipient()
    const zones = useZoneOptions()

    const range = strings.range(formatCalendarDate(params.from), formatCalendarDate(params.to))
    const zone =
        params.zoneId === null
            ? t.reports.form.allZones
            : zones.data?.find((option) => option.id === params.zoneId)?.code
    const summary = strings.summary(
        [recipient.data?.cityName, range, zone].filter((part) => part !== undefined),
    )

    return (
        <Grid
            as="section"
            aria-labelledby={headingId}
            layerStyle="panel"
            overflow="hidden"
            templateAreas={areas}
            // minmax(0, …) keeps a wide report inside the panel, so only its table scrolls.
            templateColumns={{ base: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' }}
        >
            <Box gridArea="header" p="4">
                <Heading as="h2" id={headingId} textStyle="lg" color="spark.heading">
                    {strings.title}
                </Heading>
                <Text hideBelow="md" mt="1" color="fg.muted">
                    {strings.description}
                </Text>
            </Box>

            <Box gridArea="actions" px="4" pt={{ md: '4' }} pb="4">
                <ReportExportActions params={params} reportName={reportName} range={range} />
            </Box>

            <Box
                gridArea="paper"
                px={{ base: '4', md: '6' }}
                py={{ md: '6' }}
                bg={{ md: 'bg.subtle' }}
                borderTopWidth={{ md: '1px' }}
            >
                <Box
                    maxW="880px"
                    mx="auto"
                    p={{ md: '8' }}
                    bg="bg"
                    borderWidth={{ md: '1px' }}
                    borderRadius={{ md: 'md' }}
                >
                    <Heading as="h3" textStyle="md" color="spark.heading">
                        {reportName}
                    </Heading>
                    <Text mt="1" textStyle="sm" color="fg.muted">
                        {summary}
                    </Text>

                    {preview.rows.length === 0 ? (
                        <Text mt="4" color="fg.muted">
                            {strings.noRows}
                        </Text>
                    ) : (
                        <>
                            <ReportPreviewTable preview={preview} />
                            <ReportPreviewCards preview={preview} />
                        </>
                    )}
                </Box>
            </Box>
        </Grid>
    )
}
