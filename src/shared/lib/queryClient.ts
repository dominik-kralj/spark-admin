import { QueryClient, type DefaultOptions } from '@tanstack/react-query'

const minuteInMs = 60_000

/** For a query a route loader starts: the page shows its outcome, not a silent retry on mount. */
export const startedByRouteLoader = { retryOnMount: false }

/** The app's cache rules; tests add theirs on top so they run against the same ones. */
export function createQueryClient(overrides: DefaultOptions = {}): QueryClient {
    return new QueryClient({
        defaultOptions: {
            ...overrides,
            // A page visited again within the minute shows from the cache; mutations still
            // invalidate what they change, so the user's own edits show at once.
            queries: { staleTime: minuteInMs, ...overrides.queries },
        },
    })
}
