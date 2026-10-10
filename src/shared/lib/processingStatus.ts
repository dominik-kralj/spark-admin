import { z } from 'zod'

/** Where a ticket stands in one pipeline stage (payment or fiscalization). */
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'failed'

export const processingStatuses: readonly ProcessingStatus[] = [
    'pending',
    'processing',
    'done',
    'failed',
]

/** The spec's `Status` values, shared by every ticket endpoint. */
export const rawProcessingStatusSchema = z.enum(['PENDING', 'PROCESSING', 'DONE', 'FAIL'])

type RawProcessingStatus = z.output<typeof rawProcessingStatusSchema>

const statusForRaw: Record<RawProcessingStatus, ProcessingStatus> = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    DONE: 'done',
    FAIL: 'failed',
}

const rawForStatus: Record<ProcessingStatus, RawProcessingStatus> = {
    pending: 'PENDING',
    processing: 'PROCESSING',
    done: 'DONE',
    failed: 'FAIL',
}

export function toProcessingStatus(raw: RawProcessingStatus): ProcessingStatus {
    return statusForRaw[raw]
}

export function toRawProcessingStatus(status: ProcessingStatus): RawProcessingStatus {
    return rawForStatus[status]
}
