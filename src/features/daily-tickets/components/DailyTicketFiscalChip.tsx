import type { ProcessingStatus } from '@/shared/lib/processingStatus'
import { ProcessingStatusChip } from '@/shared/ui/ProcessingStatusChip'

import { useIsFiscalizing } from '../api/useDailyTickets'

interface DailyTicketFiscalChipProps {
    id: string
    status: ProcessingStatus
}

/** The fiscal status, which reads U obradi while "Fiskaliziraj ponovno" runs. */
export function DailyTicketFiscalChip({ id, status }: DailyTicketFiscalChipProps) {
    const isFiscalizing = useIsFiscalizing(id)

    return <ProcessingStatusChip stage="fiscal" status={isFiscalizing ? 'processing' : status} />
}
