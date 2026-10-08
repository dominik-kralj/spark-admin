import { vi } from 'vitest'

/** Chakra's focus trap skips elements without layout, which in jsdom is all of them. */
export function giveElementsLayout(): void {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
        Object.assign([new DOMRect(0, 0, 100, 20)], { item: () => null }),
    )
}
