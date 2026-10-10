import { Box, Flex, Grid, Heading, Text } from '@chakra-ui/react'
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

// The actions come before the report at every width, as they do in reading order; from md
// they sit beside the heading.
const areas = { base: '"header" "actions" "paper"', md: '"header actions" "paper paper"' }

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
            // minmax(0, …) keeps a long or wide report inside the panel, so only its table scrolls.
            templateColumns={{ base: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) auto' }}
            templateRows={{ md: 'auto minmax(0, 1fr)' }}
            flex="0 1 auto"
            minH="0"
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

            <Flex
                gridArea="paper"
                direction="column"
                minH="0"
                px={{ base: '4', md: '4', lg: '6' }}
                pt={{ md: '4', lg: '6' }}
                pb={{ base: '4', lg: '6' }}
                bg={{ md: 'bg.subtle' }}
                borderTopWidth={{ md: '1px' }}
            >
                <Flex
                    direction="column"
                    minH="0"
                    w="full"
                    maxW="880px"
                    mx="auto"
                    p={{ md: '5', lg: '8' }}
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
                </Flex>
            </Flex>
        </Grid>
    )
}
