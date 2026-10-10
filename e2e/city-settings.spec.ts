import { expect, test, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectBelow,
    expectErrorMovesNothing,
    expectNoHorizontalScroll,
    expectTouchTargets,
    signIn,
} from './helpers'

const t = hr.citySettings
const { labels } = t

async function openSettings(page: Page): Promise<void> {
    await signIn(page)
    await page.goto(paths.citySettings)
    await expect(page.getByLabel(labels.name, { exact: true })).toHaveValue('Grad Samobor')
}

/** Renames the city and saves; the toast and the header both show the new name. */
async function renameAndSave(page: Page): Promise<void> {
    await page.getByLabel(labels.name, { exact: true }).fill('Grad Samobor i okolica')
    await page.getByLabel(labels.iban, { exact: true }).fill('hr12 1001 0051 8630 0016 0')
    await page.getByRole('button', { name: t.save }).click()

    await expect(page.getByText(t.saved)).toBeVisible()
    await expect(page.getByLabel(labels.iban, { exact: true })).toHaveValue('HR1210010051863000160')
    await expect(page.getByRole('banner').getByText('Grad Samobor i okolica')).toBeVisible()
}

async function expectSameRow(page: Page, left: string, right: string): Promise<void> {
    const leftBox = await page.getByLabel(left, { exact: true }).boundingBox()
    const rightBox = await page.getByLabel(right, { exact: true }).boundingBox()

    expect(rightBox?.y).toBe(leftBox?.y)
    expect(rightBox?.x).toBeGreaterThan(leftBox?.x ?? 0)
}

async function expectNoVerticalScroll(page: Page): Promise<void> {
    const overflow = await page
        .getByRole('main')
        .evaluate((element) => element.scrollHeight - element.clientHeight)

    expect(overflow).toBeLessThanOrEqual(0)
}

test.describe('City settings on wider screens', () => {
    test.skip(({ isMobile }) => isMobile, 'two-column layouts run in the desktop project')

    test('edits and saves in two columns at 768 px', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1000 })
        await openSettings(page)

        await expectSameRow(page, labels.name, labels.oib)
        await expectSameRow(page, labels.premisesCode, labels.cashRegisterCode)
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await renameAndSave(page)
    })

    test('fits the window without scrolling at 1440 px, in four columns', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await openSettings(page)

        await expectSameRow(page, labels.street, labels.zipCode)
        await expectSameRow(page, labels.city, labels.iban)
        await expectSameRow(page, labels.premisesCode, labels.vatRate)
        await expectNoVerticalScroll(page)
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await renameAndSave(page)
    })
})

test.describe('City settings on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of [320, 375]) {
        test(`edits and saves in one column at ${String(width)} px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 })
            await openSettings(page)
            const save = page.getByRole('button', { name: t.save })
            const cancel = page.getByRole('button', { name: hr.forms.cancel })

            await expectBelow(
                page.getByLabel(labels.oib, { exact: true }),
                page.getByLabel(labels.name, { exact: true }),
            )
            await expectBelow(cancel, save)
            await expectTouchTargets(save.or(cancel))
            await expectNoHorizontalScroll(page)
            await expectNoAxeViolations(page)

            await renameAndSave(page)
            await expectNoHorizontalScroll(page)
        })
    }
})

test.describe('City settings errors', () => {
    test('show a message under each field without moving the form', async ({ page }) => {
        await openSettings(page)
        const field = (label: keyof typeof labels) =>
            page.getByLabel(labels[label], { exact: true })
        const save = page.getByRole('button', { name: t.save })

        await expectErrorMovesNothing(page, {
            field: field('cashRegisterCode'),
            value: '01',
            steady: [field('vatRate'), save],
        })
        await expectErrorMovesNothing(page, {
            field: field('vatRate'),
            value: '120',
            steady: [field('premisesCode'), save],
        })
        await expectErrorMovesNothing(page, {
            field: field('iban'),
            value: 'HR1',
            steady: [field('premisesCode'), save],
        })

        await expect(page.getByText(hr.forms.validation.ibanInvalid)).toBeVisible()
        await expectNoAxeViolations(page)

        await save.click()

        await expect(field('iban')).toBeFocused()
    })
})
