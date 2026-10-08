import { z } from 'zod'

import { request } from './client'
import { isApiError } from './errors'

/** DELETE that treats a 404 as done: the item is gone, which is what the user asked for. */
export async function deleteRequest(path: string): Promise<void> {
    try {
        await request(path, { method: 'DELETE', schema: z.undefined() })
    } catch (error) {
        if (!isApiError(error) || error.kind !== 'notFound') throw error
    }
}
