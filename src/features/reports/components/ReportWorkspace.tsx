import { useState } from 'react'

import type { ReportDefinition } from '../validators/report'
import type { ReportParams } from '../validators/reportForm'

import { ReportParametersForm } from './ReportParametersForm'
import { ReportPreviewArea } from './ReportPreviewArea'

interface ReportWorkspaceProps {
    reports: ReportDefinition[]
    initialReportKey: string
}

export function ReportWorkspace({ reports, initialReportKey }: ReportWorkspaceProps) {
    // The parameters of the preview on screen; the form may already hold others.
    const [shownParams, setShownParams] = useState<ReportParams | null>(null)
    const shownReport = reports.find((report) => report.key === shownParams?.reportKey)

    return (
        <>
            <ReportParametersForm
                reports={reports}
                initialReportKey={initialReportKey}
                hasPreview={shownParams !== null}
                onSubmit={setShownParams}
            />

            <ReportPreviewArea params={shownParams} reportName={shownReport?.name ?? ''} />
        </>
    )
}
