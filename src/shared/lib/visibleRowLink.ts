/** The row link for this item that is on screen: the table's or the card's. */
export function visibleRowLink(id: string): HTMLElement | null {
    const links = document.querySelectorAll<HTMLElement>('[data-row-link]')

    return (
        [...links].find(
            (link) => link.dataset.rowLink === id && link.getClientRects().length > 0,
        ) ?? null
    )
}
