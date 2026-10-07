const desktopWidth = 1440
const remInPx = 16

let viewportWidth = desktopWidth

/** Media queries in jsdom match against this width. Reset to desktop after each test. */
export function setViewportWidth(width: number): void {
    viewportWidth = width
}

export function resetViewport(): void {
    viewportWidth = desktopWidth
}

function matches(query: string): boolean {
    const minWidth = /min-width:\s*([\d.]+)(px|rem|em)/.exec(query)
    if (!minWidth) return false

    const [, value, unit] = minWidth
    const minPx = unit === 'px' ? Number(value) : Number(value) * remInPx

    return viewportWidth >= minPx
}

/** jsdom has no matchMedia; this one answers min-width queries and never changes. */
export function installMatchMedia(): void {
    window.matchMedia = (query: string): MediaQueryList => ({
        media: query,
        matches: matches(query),
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
    })
}
