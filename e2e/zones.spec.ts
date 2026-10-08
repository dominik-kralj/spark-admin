import { expect, test } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import { expectNoHorizontalScroll, expectTouchTargets, signIn } from './helpers'

test.describe('Zone list on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the table layout runs in the desktop project')

    test('shows the table, sorts by Šifra from the keyboard', async ({ page }) => {
        await signIn(page)
        await page.goto(paths.zones)
        const table = page.getByRole('table', { name: hr.zones.listLabel })
        const codeHeader = table.getByRole('columnheader', { name: hr.zones.columns.code })

        await expect(table).toBeVisible()
        await expect(page.getByRole('list', { name: hr.zones.listLabel })).toBeHidden()
        await expect(table.getByRole('row')).toHaveCount(3)
        await expect(page.getByText(hr.zones.total(2))).toBeVisible()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await page.getByRole('button', { name: hr.zones.add }).focus()
        await page.keyboard.press('Tab')
        await expect(codeHeader.getByRole('button')).toBeFocused()
        await expect(codeHeader).toHaveAttribute('aria-sort', 'ascending')

        await page.keyboard.press('Enter')

        await expect(codeHeader).toHaveAttribute('aria-sort', 'descending')
        await expect(page).toHaveURL(`${paths.zones}?sort=code&dir=desc`)
        await expect(table.getByRole('row').nth(1)).toContainText('ZONA1')
    })
})

test.describe('Zone list on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of [320, 375]) {
        test(`shows one card per zone at ${String(width)} px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 })
            await signIn(page)
            await page.goto(paths.zones)
            const list = page.getByRole('list', { name: hr.zones.listLabel })

            await expect(list).toBeVisible()
            await expect(list.getByRole('listitem')).toHaveCount(2)
            await expect(page.getByRole('table')).toBeHidden()
            await expectTouchTargets(page.getByRole('button', { name: hr.zones.add }))
            await expectNoHorizontalScroll(page)
            await expectNoAxeViolations(page)
        })
    }
})
