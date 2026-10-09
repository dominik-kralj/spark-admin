import { Button, type ButtonProps } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import { createContext, use, useRef, useState, type ReactNode } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { errorMessage } from '@/shared/lib/errorMessage'
import { useLastDefined } from '@/shared/lib/useLastDefined'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ErrorAlert } from '@/shared/ui/ErrorAlert'

import { useFiscalizeDailyTicket, useIsFiscalizing } from '../api/useDailyTickets'
import { showFiscalizeOutcome } from '../lib/showFiscalizeOutcome'

interface FiscalizeRequest {
    ticket: { id: string; plate: string }
    trigger: HTMLElement
    /** Where focus goes when the button is gone because the ticket is now fiscalized. */
    fallbackFocus: () => HTMLElement | null
}

const RequestFiscalizeContext = createContext<((request: FiscalizeRequest) => void) | null>(null)

interface FiscalizeAgainDialogProps {
    request: FiscalizeRequest | undefined
    onClose: () => void
}

function FiscalizeAgainDialog({ request, onClose }: FiscalizeAgainDialogProps) {
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

/**
 * Owns the confirm dialog and the request, above the list and the detail: a success removes the
 * button that asked, and the result must still be shown.
 */
export function FiscalizeAgainProvider({ children }: { children: ReactNode }) {
    const [request, setRequest] = useState<FiscalizeRequest>()

    return (
        <RequestFiscalizeContext value={setRequest}>
            {children}

            <FiscalizeAgainDialog
                request={request}
                onClose={() => {
                    setRequest(undefined)
                }}
            />
        </RequestFiscalizeContext>
    )
}

interface FiscalizeAgainButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
    ticket: { id: string; plate: string }
    fallbackFocus: () => HTMLElement | null
}

/** "Fiskaliziraj ponovno", named with the plate; offered only on a failed ticket. */
export function FiscalizeAgainButton({
    ticket,
    fallbackFocus,
    ...buttonProps
}: FiscalizeAgainButtonProps) {
    const t = useStrings()
    const strings = t.dailyTickets.fiscalize
    const requestFiscalize = use(RequestFiscalizeContext)
    const isFiscalizing = useIsFiscalizing(ticket.id)

    if (requestFiscalize === null) throw new Error('FiscalizeAgainButton needs its provider')

    return (
        <Button
            {...buttonProps}
            aria-label={strings.actionFor(ticket.plate)}
            loading={isFiscalizing}
            loadingText={strings.action}
            onClick={(event) => {
                requestFiscalize({ ticket, trigger: event.currentTarget, fallbackFocus })
            }}
        >
            <RefreshCw aria-hidden="true" />
            {strings.action}
        </Button>
    )
}
