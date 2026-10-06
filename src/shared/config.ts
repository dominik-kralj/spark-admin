import { z } from 'zod'

/** The only reader of import.meta.env. Keys are documented in .env.example. */
const envSchema = z.object({
    VITE_API_BASE_URL: z.url(),
    VITE_API_KEY: z.string().min(1),
    VITE_API_MOCK: z.enum(['true', 'false']).optional(),
})

const parsed = envSchema.safeParse(import.meta.env)
if (!parsed.success) {
    throw new Error(
        `Invalid environment config (see .env.example):\n${z.prettifyError(parsed.error)}`,
    )
}

export const config = {
    /** Backend origin, without the /api/v1 base path. */
    apiBaseUrl: parsed.data.VITE_API_BASE_URL.replace(/\/+$/, ''),
    apiKey: parsed.data.VITE_API_KEY,
    useMockApi: parsed.data.VITE_API_MOCK === 'true',
} as const
