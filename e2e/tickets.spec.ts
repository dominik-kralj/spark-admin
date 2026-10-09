import { expect, test, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectNoHorizontalScroll,
    expectOnlyTableScrolls,
    expectTouchTargets,
    signIn,
    waitForAnimations,
} from './helpers'

const t = hr.tickets

async function openList(page: Page): Promise<void> {
    await signIn(page)
    await page.goto(paths.tickets)
}

test.describe('Karte on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the table layout runs in the desktop project')

    test('pages through the full table at 1440 px', async ({ page }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        const pages = page.getByRole('navigation', { name: hr.pagination.tableLabel })

        await expect(table).toBeVisible()
        await expect(page.getByRole('list', { name: t.listLabel })).toBeHidden()
        await expect(table.getByRole('columnheader')).toHaveCount(8)
        await expect(table.getByRole('row')).toHaveCount(26)
        await expect(table.getByRole('row').nth(1)).toContainText('ZG1234AB')
        await expect(page.getByText(t.shown(1, 25, 300))).toBeVisible()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await pages.getByRole('button', { name: hr.pagination.next }).click()

        await expect(page).toHaveURL(`${paths.tickets}?page=2`)
        await expect(page.getByText(t.shown(26, 50, 300))).toBeVisible()
        await expect(table.getByRole('row').nth(1)).not.toContainText('ZG1234AB')

        await pages.getByRole('button', { name: hr.pagination.page(12) }).click()

        await expect(page.getByText(t.shown(276, 300, 300))).toBeVisible()
        await expect(pages.getByRole('button', { name: hr.pagination.next })).toBeDisabled()
    })

    test('scrolls only the table rows when the window is short', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 600 })
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        await expect(table.getByRole('row')).toHaveCount(26)

        await expectOnlyTableScrolls(page, table)
        await expect(page.getByText(t.shown(1, 25, 300))).toBeInViewport()
    })

    test('opens a ticket in a 560 px drawer and closes it back to its row', async ({ page }) => {
        await openList(page)
        const link = page
            .getByRole('table', { name: t.listLabel })
            .getByRole('link', { name: 'ZG1234AB' })

        await link.click()
        const drawer = page.getByRole('dialog', { name: t.detail.title('ZG1234AB') })
        await waitForAnimations(drawer)

        expect((await drawer.boundingBox())?.width).toBe(560)
        await expect(drawer.getByRole('heading', { level: 2 })).toBeFocused()
        await expect(drawer.getByText('0,56 EUR')).toBeVisible()
        await expect(drawer.getByRole('button', { name: t.detail.copy.jir })).toBeVisible()
        await expectNoAxeViolations(page)

        await page.keyboard.press('Escape')

        await expect(drawer).toBeHidden()
        await expect(page).toHaveURL(paths.tickets)
        await expect(link).toBeFocused()
    })

    test('opens a ticket from its own link', async ({ page }) => {
        await openList(page)
        await page.getByRole('table').getByRole('link', { name: 'KA4410CD' }).click()
        const url = page.url()
        await page.goto(url)

        const drawer = page.getByRole('dialog', { name: t.detail.title('KA4410CD') })
        await expect(drawer.getByText(/Porezna uprava/)).toBeVisible()
        await drawer.getByRole('button', { name: t.detail.closeButton, exact: true }).click()

        await expect(drawer).toBeHidden()
        await expect(page).toHaveURL(paths.tickets)
        await expect(page.getByRole('table').getByRole('link', { name: 'KA4410CD' })).toBeFocused()
    })
})

test.describe('Karte on a tablet', () => {
    test.skip(({ isMobile }) => isMobile, 'the tablet width runs in the desktop project')

    test('pages through a table with fewer columns at 768 px', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        const pages = page.getByRole('navigation', { name: hr.pagination.tableLabel })

        await expect(table).toBeVisible()
        await expect(table.getByRole('columnheader').filter({ visible: true })).toHaveText([
            t.columns.plate,
            t.columns.zone,
            t.columns.validUntil,
            t.columns.payment,
            t.columns.fiscal,
        ])
        await expect(page.getByText(t.moreInDetail)).toBeVisible()
        await expect(pages.getByText(hr.pagination.pageOfTotal(1, 12))).toBeVisible()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await pages.getByRole('button', { name: hr.pagination.next }).click()

        await expect(pages.getByText(hr.pagination.pageOfTotal(2, 12))).toBeVisible()
        await expect(page).toHaveURL(`${paths.tickets}?page=2`)
    })
})

test.describe('Karte on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of [320, 375]) {
        test(`pages through the cards at ${String(width)} px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 })
            await openList(page)
            const list = page.getByRole('list', { name: t.listLabel })
            const pages = page.getByRole('navigation', { name: hr.pagination.listLabel })

            await expect(list).toBeVisible()
            await expect(list.getByRole('listitem')).toHaveCount(25)
            await expect(page.getByRole('table')).toBeHidden()
            await expectTouchTargets(list.getByRole('link'))
            await expectTouchTargets(pages.getByRole('button'))
            await expectNoHorizontalScroll(page)
            await expectNoAxeViolations(page)

            await pages.getByRole('button', { name: hr.pagination.next }).click()

            await expect(page.getByText(t.shownShort(26, 50, 300), { exact: true })).toBeVisible()
            await expect(page).toHaveURL(`${paths.tickets}?page=2`)
            await expect(list.getByRole('listitem').first()).not.toContainText('ZG1234AB')
        })
    }

    test('opens a ticket full screen and goes back to its card', async ({ page }) => {
        await openList(page)
        const cardLink = page
            .getByRole('list', { name: t.listLabel })
            .getByRole('link', { name: /ZG5553AI/ })

        await cardLink.click()
        const drawer = page.getByRole('dialog', { name: t.detail.title('ZG5553AI') })
        await waitForAnimations(drawer)

        expect((await drawer.boundingBox())?.width).toBe(375)
        await expect(
            drawer.getByRole('button', { name: t.detail.closeButton, exact: true }),
        ).toBeHidden()
        await expectTouchTargets(drawer.getByRole('button').filter({ visible: true }))
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await drawer.getByRole('button', { name: t.detail.back }).click()

        await expect(drawer).toBeHidden()
        await expect(page).toHaveURL(paths.tickets)
        await expect(cardLink).toBeFocused()
    })
})
