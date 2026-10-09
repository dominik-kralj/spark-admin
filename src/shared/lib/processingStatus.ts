/** Where a ticket stands in one pipeline stage (payment or fiscalization). */
export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'failed'

export const processingStatuses: readonly ProcessingStatus[] = [
    'pending',
    'processing',
    'done',
    'failed',
]
