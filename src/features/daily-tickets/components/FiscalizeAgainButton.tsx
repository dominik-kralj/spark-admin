import { Button, type ButtonProps } from '@chakra-ui/react'
import { RefreshCw } from 'lucide-react'
import { use } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

import { useIsFiscalizing } from '../api/useDailyTickets'
import { RequestFiscalizeContext, type FiscalizeRequest } from '../lib/fiscalizeRequest'

type FiscalizeAgainButtonProps = Omit<ButtonProps, 'onClick' | 'children'> &
    Omit<FiscalizeRequest, 'trigger'>

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
