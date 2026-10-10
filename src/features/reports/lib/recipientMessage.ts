import type { UseQueryResult } from '@tanstack/react-query'

import type { Dictionary } from '@/shared/i18n/dictionary'

import type { ReportRecipient } from '../validators/report'

/** The line under Pošalji e-poštom: where the report goes, or why it cannot go yet. */
export function recipientMessage(
    recipient: UseQueryResult<ReportRecipient>,
    t: Dictionary,
): string | undefined {
    const strings = t.reports.email
    if (recipient.data !== undefined) {
        const { email } = recipient.data

        return email === null ? strings.noRecipient : strings.recipient(email)
    }
    if (recipient.isError) return strings.recipientUnavailable

    return undefined
}
