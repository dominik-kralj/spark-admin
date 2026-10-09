import { Check, Clock, RefreshCw, X } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { ProcessingStatus } from '@/shared/lib/processingStatus'

import { StatusChip, type StatusChipStyle } from './StatusChip'

// Each status has its own icon shape and lightness, so it reads in greyscale too.
const chips: Record<ProcessingStatus, StatusChipStyle> = {
    pending: { colorPalette: 'gray', Icon: Clock },
    processing: { colorPalette: 'blue', Icon: RefreshCw },
    done: { colorPalette: 'green', Icon: Check },
    failed: { colorPalette: 'red', Icon: X },
}

interface ProcessingStatusChipProps {
    /** Payment and fiscalization word "done" differently: Plaćeno, Fiskalizirano. */
    stage: 'payment' | 'fiscal'
    status: ProcessingStatus
}

export function ProcessingStatusChip({ stage, status }: ProcessingStatusChipProps) {
    const t = useStrings()

    return <StatusChip {...chips[status]} label={t.processingStatus[stage][status]} />
}
