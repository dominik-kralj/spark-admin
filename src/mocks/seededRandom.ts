const plateLetters = 'ABCDEFGHIJKLMNOPRSTUVZ'

/** Mulberry32 and helpers on it: the same seed gives the same data on every run. */
export function createSeededRandom(seed: number) {
    let state = seed

    function random(): number {
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    function pick<T>(items: readonly T[]): T {
        return items[Math.floor(random() * items.length)] as T
    }

    function hex(length: number): string {
        return Array.from({ length }, () => Math.floor(random() * 16).toString(16)).join('')
    }

    function guid(): string {
        return `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`
    }

    function plate(): string {
        const letter = () => plateLetters.charAt(Math.floor(random() * plateLetters.length))
        const digits = Array.from({ length: random() < 0.7 ? 4 : 3 }, () =>
            String(Math.floor(random() * 10)),
        ).join('')

        return `${pick(['ZG', 'ZG', 'ZG', 'ST', 'RI', 'KA', 'OS', 'VŽ'])}${digits}${letter()}${random() < 0.8 ? letter() : ''}`
    }

    /** One key, drawn with the given weights. */
    function weighted<T extends string>(weights: Record<T, number>): T {
        const entries = Object.entries(weights) as [T, number][]
        let roll = random() * entries.reduce((sum, [, weight]) => sum + weight, 0)
        for (const [key, weight] of entries) {
            roll -= weight
            if (roll < 0) return key
        }

        // Only rounding gets here; the last key is where the roll ended.
        const [last] = entries.at(-1) ?? []
        if (last === undefined) throw new Error('No weights')

        return last
    }

    return { random, pick, hex, guid, plate, weighted }
}
