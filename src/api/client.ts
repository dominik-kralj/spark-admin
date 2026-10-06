import type { z } from 'zod'

import { config } from '@/shared/config'

import { ApiError, kindForStatus } from './errors'
import { getAccessToken } from './session'

const basePath = '/api/v1/admin'

export type QueryValue = string | number | boolean | null | undefined

interface RequestOptions<TSchema extends z.ZodType> {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    /** Values that are undefined, null or '' are left out of the URL. */
    query?: Record<string, QueryValue>
    /** Sent as JSON. */
    body?: unknown
    /** Parses the response body; a 204 or empty body is parsed as undefined. */
    schema: TSchema
    signal?: AbortSignal
}

/**
 * The single HTTP entry point. Adds the base path, X-API-KEY and the bearer
 * token, and turns every failure except an abort into an ApiError.
 */
export async function request<TSchema extends z.ZodType>(
    path: string,
    { method = 'GET', query, body, schema, signal }: RequestOptions<TSchema>,
): Promise<z.output<TSchema>> {
    const headers = new Headers({ Accept: 'application/json', 'X-API-KEY': config.apiKey })
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (body !== undefined) headers.set('Content-Type', 'application/json')

    let response: Response
    try {
        response = await fetch(buildUrl(path, query), {
            method,
            headers,
            body: body === undefined ? null : JSON.stringify(body),
            signal: signal ?? null,
        })
    } catch (error) {
        if (isAbort(error, signal)) throw error
        throw new ApiError('network', undefined, { cause: error })
    }

    if (!response.ok) {
        // The kind comes from the status alone, so a non-JSON body is fine to ignore.
        throw new ApiError(kindForStatus(response.status), response.status)
    }

    let data: unknown
    try {
        const text = await response.text()
        data = text === '' ? undefined : JSON.parse(text)
    } catch (error) {
        if (isAbort(error, signal)) throw error
        throw new ApiError('invalidResponse', response.status, { cause: error })
    }

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
        throw new ApiError('invalidResponse', response.status, { cause: parsed.error })
    }

    return parsed.data
}

function buildUrl(path: string, query: Record<string, QueryValue> | undefined): string {
    const url = new URL(`${config.apiBaseUrl}${basePath}${path}`)

    for (const [key, value] of Object.entries(query ?? {})) {
        if (value === undefined || value === null || value === '') continue
        url.searchParams.append(key, String(value))
    }

    return url.toString()
}

function isAbort(error: unknown, signal: AbortSignal | undefined): boolean {
    return (
        signal?.aborted === true || (error instanceof DOMException && error.name === 'AbortError')
    )
}
