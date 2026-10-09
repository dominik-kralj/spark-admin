/** The row link for this ticket that is on screen: the table's or the card's. */
export function visibleRowLink(ticketId: string): HTMLElement | null {
    const links = document.querySelectorAll<HTMLElement>('[data-ticket-link]')

    return (
        [...links].find(
            (link) => link.dataset.ticketLink === ticketId && link.getClientRects().length > 0,
        ) ?? null
    )
}
