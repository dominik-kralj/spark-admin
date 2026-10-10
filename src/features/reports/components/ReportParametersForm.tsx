import { Box, Button, chakra, Grid } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { useStrings } from '@/shared/i18n/useStrings'
import { fieldMessage } from '@/shared/lib/fieldMessage'
import { useZoneOptions } from '@/shared/lib/useZoneOptions'
import { LevelWithInputs } from '@/shared/ui/LevelWithInputs'
import { ZoneOptions } from '@/shared/ui/ZoneOptions'

import { initialReportFormValues } from '../lib/initialReportFormValues'
import type { ReportDefinition } from '../validators/report'
import { reportFormSchema, type ReportForm, type ReportParams } from '../validators/reportForm'

import { ReportDateField } from './ReportDateField'
import { ReportSelectField } from './ReportSelectField'

interface ReportParametersFormProps {
    reports: ReportDefinition[]
    initialReportKey: string
    /** True once a preview was asked for; Prikaži pregled then waits for a change. */
    hasPreview: boolean
    onSubmit: (params: ReportParams) => void
}

const gridColumns = { base: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) 20.75rem minmax(0, 1fr) auto' }

// Side by side only while both show a whole date; on a 320 px phone two would clip it.
const dateColumns = { base: 'repeat(auto-fit, minmax(9rem, 1fr))', lg: 'repeat(2, 10rem)' }

export function ReportParametersForm({
    reports,
    initialReportKey,
    hasPreview,
    onSubmit,
}: ReportParametersFormProps) {
    const t = useStrings()
    const f = t.reports.form
    const zones = useZoneOptions()
    // Read once, so the range stays as set if midnight passes while the page is open.
    const [defaultValues] = useState(() => initialReportFormValues(initialReportKey, new Date()))
    const form: ReportForm = useForm({
        resolver: zodResolver(reportFormSchema),
        defaultValues,
        mode: 'onTouched',
    })
    const { isDirty } = form.formState

    const submit = form.handleSubmit((params) => {
        // What was asked for becomes the baseline, so the button waits for a change.
        form.reset(form.getValues())
        onSubmit(params)
    })

    return (
        <chakra.form
            layerStyle="panel"
            p="4"
            aria-label={f.label}
            noValidate
            onSubmit={(event) => void submit(event)}
        >
            <Grid templateColumns={gridColumns} columnGap="3" rowGap="1">
                <Box>
                    <ReportSelectField
                        label={f.report}
                        error={fieldMessage({
                            error: form.formState.errors.reportKey,
                            ruleMessages: t.forms.validation,
                            t,
                        })}
                        registration={form.register('reportKey')}
                    >
                        {reports.map((report) => (
                            <option key={report.key} value={report.key}>
                                {report.name}
                            </option>
                        ))}
                    </ReportSelectField>
                </Box>

                <Grid templateColumns={dateColumns} columnGap="3" rowGap="1">
                    <ReportDateField form={form} name="from" />
                    <ReportDateField form={form} name="to" />
                </Grid>

                <Box>
                    <ReportSelectField label={f.zone} registration={form.register('zoneId')}>
                        <ZoneOptions zones={zones.data} allZonesLabel={f.allZones} />
                    </ReportSelectField>
                </Box>

                <Box>
                    <LevelWithInputs label={f.submit}>
                        <Button
                            type="submit"
                            colorPalette="blue"
                            w={{ base: 'full', lg: 'auto' }}
                            disabled={hasPreview && !isDirty}
                        >
                            {f.submit}
                        </Button>
                    </LevelWithInputs>
                </Box>
            </Grid>
        </chakra.form>
    )
}
