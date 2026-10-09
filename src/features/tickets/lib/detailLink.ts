import { paths } from '@/shared/paths'

/** Router state on a link from the list, so closing the detail can go back instead of forward. */
export const fromListState = { fromList: true }

export function wasOpenedFromList(state: unknown): boolean {
    return typeof state === 'object' && state !== null && 'fromList' in state
}

/** The detail's URL keeps the list's page and sort, so closing it returns to the same rows. */
export function ticketDetailPath(ticketId: string, search: string): string {
    return `${paths.tickets}/${encodeURIComponent(ticketId)}${search}`
}
