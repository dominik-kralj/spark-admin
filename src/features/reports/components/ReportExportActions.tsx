import { Button, Stack, Text } from '@chakra-ui/react'
import { Download, Mail } from 'lucide-react'
import { useId, useState } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { saveFile } from '@/shared/lib/saveFile'
import { toaster } from '@/shared/lib/toaster'

import { useExportReportPdf, useReportRecipient } from '../api/useReports'
import { recipientMessage } from '../lib/recipientMessage'
import { reportFileName } from '../lib/reportFileName'
import type { ReportParams } from '../validators/reportForm'

import { SendReportDialog } from './SendReportDialog'

const pdfErrorToastId = 'report-pdf-error'

interface ReportExportActionsProps {
    params: ReportParams
    reportName: string
    /** The previewed days as text, for the e-mail confirmation. */
    range: string
}

export function ReportExportActions({ params, reportName, range }: ReportExportActionsProps) {
    const t = useStrings()
    const strings = t.reports
    const recipient = useReportRecipient()
    const exportPdf = useExportReportPdf()
    const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
    const recipientTextId = useId()

    const email = recipient.data?.email ?? null
    const recipientText = recipientMessage(recipient, t)

    function downloadPdf() {
        toaster.dismiss(pdfErrorToastId)
        exportPdf.mutate(params, {
            onSuccess: (file) => {
                const fileName = reportFileName(params)
                saveFile(file, fileName)
                toaster.success({
                    title: strings.pdf.downloaded,
                    description: strings.pdf.downloadedDescription(fileName),
                })
            },
            onError: (error) => {
                // It stays until closed or retried, so the retry cannot time out.
                toaster.error({
                    id: pdfErrorToastId,
                    title: strings.pdf.failed,
                    description: errorMessage(error, strings.errors),
                    duration: Infinity,
                    action: { label: t.listStates.retry, onClick: downloadPdf },
                })
            },
        })
    }

    return (
        <Stack gap="2" align={{ md: 'flex-end' }}>
            <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: '2', md: '3' }}>
                <Button
                    variant="outline"
                    loading={exportPdf.isPending}
                    loadingText={strings.pdf.button}
                    onClick={downloadPdf}
                >
                    <Download aria-hidden="true" />
                    {strings.pdf.button}
                </Button>
                <Button
                    variant="outline"
                    aria-describedby={recipientText === undefined ? undefined : recipientTextId}
                    disabled={email === null}
                    onClick={() => {
                        setIsSendDialogOpen(true)
                    }}
                >
                    <Mail aria-hidden="true" />
                    {strings.email.button}
                </Button>
            </Stack>

            {recipientText !== undefined && (
                <Text id={recipientTextId} textStyle="xs" color="fg.muted">
                    {recipientText}
                </Text>
            )}

            {email !== null && (
                <SendReportDialog
                    isOpen={isSendDialogOpen}
                    params={params}
                    description={strings.email.confirmDescription(reportName, range, email)}
                    email={email}
                    onClose={() => {
                        setIsSendDialogOpen(false)
                    }}
                />
            )}
        </Stack>
    )
}
