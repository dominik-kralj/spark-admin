import type { z } from 'zod'

import { config } from '@/shared/config'

import { ApiError, kindForStatus } from './errors'
import { endSession, getAccessToken } from './session'

const basePath = '/api/v1/admin'

type QueryValue = string | number | boolean | null | undefined

interface RequestOptions<TSchema extends z.ZodType> {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    query?: Record<string, QueryValue>
    body?: unknown
    /** A 204 or empty body is parsed as undefined. */
    schema: TSchema
    signal?: AbortSignal
}

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
        throw new ApiError('network', { cause: error })
    }

    if (!response.ok) {
        // Only the session that sent the token expired; no token means a wrong login.
        if (response.status === 401 && token && token === getAccessToken()) {
            endSession('expired')
        }
        // The kind comes from the status alone; the body only marks form fields, so it may be missing.
        throw new ApiError(kindForStatus(response.status), {
            status: response.status,
            body: await readErrorBody(response),
        })
    }

    let data: unknown
    try {
        const text = await response.text()
        data = text === '' ? undefined : JSON.parse(text)
    } catch (error) {
        if (isAbort(error, signal)) throw error
        throw new ApiError('invalidResponse', { status: response.status, cause: error })
    }

    const parsed = schema.safeParse(data)
    if (!parsed.success) {
        throw new ApiError('invalidResponse', { status: response.status, cause: parsed.error })
    }

    return parsed.data
}

async function readErrorBody(response: Response): Promise<unknown> {
    try {
        return JSON.parse(await response.text()) as unknown
    } catch {
        return undefined
    }
}

function buildUrl(path: string, query: Record<string, QueryValue> | undefined): string {
    const url = new URL(`${config.apiBaseUrl}${basePath}${path}`)

    for (const [key, value] of Object.entries(query ?? {})) {
        if (value === undefined || value === null || value === '') continue
        url.searchParams.append(key, String(value))
    }

    return url.toString()
}

// After an abort, whatever fetch throws is the cancellation TanStack Query expects.
function isAbort(error: unknown, signal: AbortSignal | undefined): boolean {
    return (
        signal?.aborted === true || (error instanceof DOMException && error.name === 'AbortError')
    )
}
