import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { useLastDefined } from '@/shared/lib/useLastDefined'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'

import { useFiscalizeDailyTicket } from '../api/useDailyTickets'
import type { FiscalizeRequest } from '../lib/fiscalizeRequest'
import { showFiscalizeOutcome } from '../lib/showFiscalizeOutcome'

interface FiscalizeAgainDialogProps {
    request: FiscalizeRequest | undefined
    onClose: () => void
}

/** Asks first; a failed request keeps the dialog open with the reason. */
export function FiscalizeAgainDialog({ request, onClose }: FiscalizeAgainDialogProps) {
    const t = useStrings()
    const strings = t.dailyTickets.fiscalize
    const fiscalize = useFiscalizeDailyTicket()
    // Keeps the text while the dialog fades out.
    const shown = useLastDefined(request)
    // isPending reaches the button a tick after mutate; this stops a press in between.
    const isRequestedRef = useRef(false)

    if (shown === undefined) return null

    const { ticket, trigger, fallbackFocus } = shown

    function close() {
        onClose()
        fiscalize.reset()
    }

    return (
        <ConfirmDialog
            isOpen={request !== undefined}
            title={strings.confirmTitle(ticket.plate)}
            description={strings.confirmDescription}
            confirmLabel={strings.action}
            cancelLabel={t.forms.cancel}
            tone="action"
            isConfirming={fiscalize.isPending}
            error={
                fiscalize.error && (
                    <ErrorAlert
                        title={strings.failed}
                        message={errorMessage(fiscalize.error, strings.errors)}
                    />
                )
            }
            onConfirm={() => {
                if (isRequestedRef.current) return
                isRequestedRef.current = true
                fiscalize.mutate(ticket.id, {
                    onSettled: () => {
                        isRequestedRef.current = false
                    },
                    onSuccess: (detail) => {
                        showFiscalizeOutcome(detail, strings)
                        close()
                    },
                })
            }}
            onCancel={close}
            finalFocusEl={() => (trigger.isConnected ? trigger : fallbackFocus())}
        />
    )
}
