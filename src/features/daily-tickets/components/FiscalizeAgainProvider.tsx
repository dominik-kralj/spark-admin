import { useState, type ReactNode } from 'react'

import { RequestFiscalizeContext, type FiscalizeRequest } from '../lib/fiscalizeRequest'

import { FiscalizeAgainDialog } from './FiscalizeAgainDialog'

// Above the list and the detail: a success removes the button that asked, not the dialog.
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
