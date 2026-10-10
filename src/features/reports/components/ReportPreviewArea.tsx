import { FileText } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ErrorState } from '@/shared/ui/ErrorState'
import { LoadingState } from '@/shared/ui/LoadingState'

import { useReportPreview } from '../api/useReports'
import type { ReportParams } from '../validators/reportForm'

import { ReportPreviewPanel } from './ReportPreviewPanel'

const skeletonColumnWidths = [2, 2, 1, 1]

interface ReportPreviewAreaProps {
    /** The parameters of the preview asked for; null before the first one. */
    params: ReportParams | null
    reportName: string
}

export function ReportPreviewArea({ params, reportName }: ReportPreviewAreaProps) {
    const t = useStrings()
    const preview = useReportPreview(params)

    if (params === null) {
        return (
            <EmptyState
                icon={<FileText />}
                title={t.reports.noPreview.title}
                description={t.reports.noPreview.description}
            />
        )
    }

    if (preview.isPending) {
        return <LoadingState label={t.reports.previewLoading} columnWidths={skeletonColumnWidths} />
    }

    if (preview.isError) {
        return (
            <ErrorState
                title={t.reports.previewErrorTitle}
                error={preview.error}
                onRetry={() => void preview.refetch()}
                isRetrying={preview.isFetching}
            />
        )
    }

    return <ReportPreviewPanel params={params} reportName={reportName} preview={preview.data} />
}
