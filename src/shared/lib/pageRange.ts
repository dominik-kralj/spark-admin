/** One page of a list the server pages. */
export interface Page<T> {
    items: T[]
    page: number
    pageSize: number
    totalCount: number
}

export interface PageRange {
    from: number
    to: number
    total: number
    pageSize: number
}

export function pageRange({ items, page, pageSize, totalCount }: Page<unknown>): PageRange {
    const from = (page - 1) * pageSize + 1

    return { from, to: from + items.length - 1, total: totalCount, pageSize }
}
