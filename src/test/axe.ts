import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Fails the test with a readable list if axe finds violations. jsdom has no
 * layout, so colour contrast is checked against the design tokens, not here.
 */
export async function expectNoAxeViolations(container: Element): Promise<void> {
    const { violations } = await axe.run(container, {
        rules: { 'color-contrast': { enabled: false } },
    })

    const summary = violations.map(
        (v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
    )

    expect(summary).toEqual([])
}
