import { FileText } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useReportDefinitions } from '../api/useReports'

import { ReportWorkspace } from './ReportWorkspace'

const skeletonColumnWidths = [2, 2, 1, 1]

export function ReportsContent() {
    const t = useStrings()
    const reports = useReportDefinitions()

    if (reports.isPending) {
        return <LoadingState label={t.reports.loading} columnWidths={skeletonColumnWidths} />
    }

    if (reports.isError) {
        return (
            <ErrorState
                title={t.reports.errorTitle}
                error={reports.error}
                onRetry={() => void reports.refetch()}
                isRetrying={reports.isFetching}
            />
        )
    }

    const [firstReport] = reports.data
    if (firstReport === undefined) {
        return (
            <EmptyState
                icon={<FileText />}
                title={t.reports.empty.title}
                description={t.reports.empty.description}
            />
        )
    }

    return <ReportWorkspace reports={reports.data} initialReportKey={firstReport.key} />
}
