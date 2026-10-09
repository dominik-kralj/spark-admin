/** Router state on a link from the list, so closing the detail can go back instead of forward. */
export const fromListState = { fromList: true }

export function wasOpenedFromList(state: unknown): boolean {
    return typeof state === 'object' && state !== null && 'fromList' in state
}

/** The detail's URL keeps the list's page, sort and filters, so closing it returns to the same rows. */
export function detailPath(listPath: string, id: string, search: string): string {
    return `${listPath}/${encodeURIComponent(id)}${search}`
}
