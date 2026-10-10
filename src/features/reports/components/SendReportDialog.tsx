import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { toaster } from '@/shared/lib/toaster'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'

import { useSendReportEmail } from '../api/useReports'
import type { ReportParams } from '../validators/reportForm'

interface SendReportDialogProps {
    isOpen: boolean
    params: ReportParams
    description: string
    email: string
    onClose: () => void
}

/** Asks first; a failed send keeps the dialog open with the reason. */
export function SendReportDialog({
    isOpen,
    params,
    description,
    email,
    onClose,
}: SendReportDialogProps) {
    const t = useStrings()
    const strings = t.reports.email
    const send = useSendReportEmail()
    // isPending reaches the button a tick after mutate; this stops a press in between.
    const isRequestedRef = useRef(false)

    function close() {
        onClose()
        send.reset()
    }

    return (
        <ConfirmDialog
            isOpen={isOpen}
            title={strings.confirmTitle}
            description={description}
            confirmLabel={strings.confirm}
            cancelLabel={t.forms.cancel}
            tone="action"
            isConfirming={send.isPending}
            error={
                send.error && (
                    <ErrorAlert
                        title={strings.failed}
                        message={errorMessage(send.error, t.reports.errors)}
                    />
                )
            }
            onConfirm={() => {
                if (isRequestedRef.current) return
                isRequestedRef.current = true
                send.mutate(params, {
                    onSettled: () => {
                        isRequestedRef.current = false
                    },
                    onSuccess: () => {
                        toaster.success({
                            title: strings.sent,
                            description: strings.sentDescription(email),
                        })
                        close()
                    },
                })
            }}
            onCancel={close}
        />
    )
}
