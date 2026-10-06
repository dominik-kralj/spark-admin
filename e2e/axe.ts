import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

export async function expectNoAxeViolations(page: Page): Promise<void> {
    const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()

    const summary = violations.map(
        (v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
    )

    expect(summary).toEqual([])
}
