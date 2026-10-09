import { expect, test, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import { expectNoHorizontalScroll, expectTouchTargets, signIn, waitForAnimations } from './helpers'

const t = hr.dailyTickets
const f = hr.ticketFilters
const photos = t.detail.photos

async function openList(page: Page): Promise<void> {
    await signIn(page)
    await page.goto(paths.dailyTickets)
}

test.describe('DPK on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the table layout runs in the desktop project')

    test('filters inline at 1440 px', async ({ page }) => {
        await openList(page)
        const bar = page.getByRole('search', { name: t.filters.label })
        const table = page.getByRole('table', { name: t.listLabel })

        await expect(table.getByRole('columnheader')).toHaveCount(8)
        await expect(table.getByRole('row')).toHaveCount(26)
        await expectNoAxeViolations(page)

        await bar.getByRole('textbox', { name: f.from }).fill('05.10.2026')
        await bar.getByRole('textbox', { name: f.to }).fill('06.10.2026')
        await bar
            .getByRole('combobox', { name: f.fiscal })
            .selectOption({ label: hr.processingStatus.fiscal.failed })
        await bar.getByRole('button', { name: f.search }).click()

        await expect(page).toHaveURL(
            `${paths.dailyTickets}?from=2026-10-05&to=2026-10-06&fiscal=failed`,
        )
        await expect(table.getByRole('link').first()).toHaveText('ZG9087KL')
        await expect(table.getByRole('link').nth(1)).toHaveText('ZG6140TR')
        const statuses = table.getByRole('row').filter({ has: page.getByRole('cell') })
        for (const row of await statuses.all()) {
            await expect(row).toContainText(hr.processingStatus.fiscal.failed)
        }
        await expectNoHorizontalScroll(page)

        await bar.getByRole('button', { name: f.clear }).click()
        await expect(page).toHaveURL(paths.dailyTickets)
    })

    test('opens a daily ticket with its photos in a 560 px drawer', async ({ page }) => {
        await openList(page)
        const link = page.getByRole('table', { name: t.listLabel }).getByRole('link', {
            name: 'ZG9087KL',
        })

        await link.click()
        const drawer = page.getByRole('dialog', { name: t.detail.title('ZG9087KL') })
        await waitForAnimations(drawer)

        expect((await drawer.boundingBox())?.width).toBe(560)
        await expect(drawer.getByRole('heading', { level: 2 })).toBeFocused()
        const firstPhoto = drawer.getByRole('button', { name: photos.enlarge(1, 3) })
        await expect(firstPhoto.getByRole('img')).toHaveJSProperty('complete', true)
        // Sized by its 4:3 frame before and after loading, so nothing below it moves.
        const box = await firstPhoto.boundingBox()
        expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(4 / 3, 1)
        await expectNoAxeViolations(page)

        await firstPhoto.focus()
        await page.keyboard.press('Enter')
        const viewer = page.getByRole('dialog', { name: photos.viewerTitle(1, 3) })
        await waitForAnimations(viewer)

        await expect(viewer.getByAltText(photos.alt('ZG9087KL', 1, 3))).toBeVisible()
        await expectNoAxeViolations(page)

        await page.keyboard.press('Escape')
        await expect(viewer).toBeHidden()
        await expect(firstPhoto).toBeFocused()

        await page.keyboard.press('Escape')
        await expect(drawer).toBeHidden()
        await expect(link).toBeFocused()
    })

    test('fiscalizes a failed daily ticket again at 1440 px', async ({ page }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        const row = table.getByRole('row').filter({ hasText: 'ZG9087KL' })
        const retry = row.getByRole('button', { name: t.fiscalize.actionFor('ZG9087KL') })

        await expect(row).toContainText(hr.processingStatus.fiscal.failed)
        await retry.click()
        const dialog = page.getByRole('alertdialog', { name: t.fiscalize.confirmTitle('ZG9087KL') })
        await waitForAnimations(dialog)

        await expect(dialog.getByRole('button', { name: hr.forms.cancel })).toBeFocused()
        await expectNoAxeViolations(page)
        await dialog.getByRole('button', { name: t.fiscalize.action }).click()

        await expect(page.getByText(t.fiscalize.done('ZG9087KL'))).toBeVisible()
        await expect(dialog).toBeHidden()
        await expect(row).toContainText(hr.processingStatus.fiscal.done)
        await expect(retry).toBeHidden()
        await expect(row.getByRole('link', { name: 'ZG9087KL' })).toBeFocused()

        await row.getByRole('link', { name: 'ZG9087KL' }).click()
        const drawer = page.getByRole('dialog', { name: t.detail.title('ZG9087KL') })
        await expect(drawer.getByText(t.detail.failure.title)).toBeHidden()
        await expect(drawer.getByText(hr.processingStatus.fiscal.done)).toBeVisible()
    })
})

test.describe('DPK on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    test('filters by plate on the page and the rest in the drawer at 375 px', async ({ page }) => {
        await openList(page)
        const bar = page.getByRole('search', { name: t.filters.label })
        const list = page.getByRole('list', { name: t.listLabel })
        const plate = bar.getByRole('searchbox', { name: f.plate })

        await expect(page.getByRole('table')).toBeHidden()
        await expect(list.getByRole('listitem')).toHaveCount(25)
        await expectTouchTargets(list.getByRole('link'))
        await expectTouchTargets(list.getByRole('button'))
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await plate.fill('zg 90')
        await plate.press('Enter')
        await expect(page).toHaveURL(`${paths.dailyTickets}?plate=ZG90`)

        await bar.getByRole('button', { name: f.open }).click()
        const drawer = page.getByRole('dialog', { name: f.drawerTitle })
        await waitForAnimations(drawer)
        await drawer
            .getByRole('combobox', { name: f.fiscal })
            .selectOption({ label: hr.processingStatus.fiscal.failed })
        await drawer.getByRole('button', { name: f.apply }).click()

        await expect(drawer).toBeHidden()
        await expect(page).toHaveURL(`${paths.dailyTickets}?plate=ZG90&fiscal=failed`)
        await expect(list.getByRole('listitem').first()).toContainText('ZG9087KL')
        await expect(
            list.getByRole('button', { name: t.fiscalize.actionFor('ZG9087KL') }),
        ).toBeVisible()
        await expectNoHorizontalScroll(page)
    })

    test('opens a daily ticket with its photos full screen at 375 px', async ({ page }) => {
        await openList(page)
        const cardLink = page
            .getByRole('list', { name: t.listLabel })
            .getByRole('link', { name: /ZG9087KL/ })

        await cardLink.click()
        const drawer = page.getByRole('dialog', { name: t.detail.title('ZG9087KL') })
        await waitForAnimations(drawer)

        expect((await drawer.boundingBox())?.width).toBe(375)
        await expect(drawer.getByText(photos.hintTouch)).toBeVisible()
        await expectTouchTargets(drawer.getByRole('button').filter({ visible: true }))
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await drawer.getByRole('button', { name: photos.enlarge(3, 3) }).click()
        const viewer = page.getByRole('dialog', { name: photos.viewerTitle(3, 3) })
        await waitForAnimations(viewer)
        expect((await viewer.boundingBox())?.width).toBe(375)
        await viewer.getByRole('button', { name: photos.closeViewer }).click()
        await expect(viewer).toBeHidden()

        await drawer.getByRole('button', { name: t.detail.back }).click()
        await expect(drawer).toBeHidden()
        await expect(cardLink).toBeFocused()
    })
})
