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

function toPx(value: string, unit: string): number {
    return unit === 'px' ? Number(value) : Number(value) * remInPx
}

/** Answers min-width and max-width conditions, alone or joined with "and". */
function matches(query: string): boolean {
    const conditions = [...query.matchAll(/(min|max)-width:\s*([\d.]+)(px|rem|em)/g)]
    if (conditions.length === 0) return false

    return conditions.every(([, bound, value = '', unit = '']) =>
        bound === 'min' ? viewportWidth >= toPx(value, unit) : viewportWidth <= toPx(value, unit),
    )
}

/** jsdom has no matchMedia; this one answers width queries and never changes. */
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
