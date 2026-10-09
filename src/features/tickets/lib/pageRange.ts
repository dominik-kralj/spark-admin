import type { TicketPage } from '../validators/ticket'

/** Which rows a page shows: "Prikazano 26–50 od 300". */
export interface PageRange {
    from: number
    to: number
    total: number
    pageSize: number
}

export function pageRange({ items, page, pageSize, totalCount }: TicketPage): PageRange {
    const from = (page - 1) * pageSize + 1

    return { from, to: from + items.length - 1, total: totalCount, pageSize }
}
