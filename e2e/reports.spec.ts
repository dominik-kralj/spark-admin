import { readFile } from 'node:fs/promises'

import { expect, test, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import { expectNoHorizontalScroll, expectTouchTargets, signIn } from './helpers'

const t = hr.reports

async function showPreview(page: Page): Promise<void> {
    await signIn(page)
    await page.goto(paths.reports)
    await page
        .getByLabel(t.form.report, { exact: true })
        .selectOption({ label: 'Prihod po zonama' })
    await page.getByRole('button', { name: t.form.submit }).click()
    await expect(page.getByRole('heading', { level: 3, name: 'Prihod po zonama' })).toBeVisible()
}

test.describe('Izvještaji', () => {
    test('generates a preview that fits the window', async ({ page, isMobile }) => {
        await showPreview(page)

        const table = page.getByRole('table', { name: t.preview.tableLabel })
        const cards = page.getByRole('list', { name: t.preview.tableLabel })
        if (isMobile) {
            await expect(cards).toBeVisible()
            await expect(table).toBeHidden()
            await expect(cards.getByRole('listitem').filter({ hasText: 'ZONA1' })).toBeVisible()
            await expectTouchTargets(
                page.getByRole('button', {
                    name: new RegExp(`${t.pdf.button}|${t.email.button}|${t.form.submit}`),
                }),
            )
        } else {
            await expect(table).toBeVisible()
            await expect(cards).toBeHidden()
            await expect(table.getByRole('row', { name: /ZONA1/ })).toBeVisible()
        }
        await expect(page.getByRole('button', { name: t.form.submit })).toBeDisabled()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)
    })

    test('fits a 320 px phone with the dates one under the other', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'a phone layout')
        await page.setViewportSize({ width: 320, height: 700 })
        await showPreview(page)

        const from = await page.getByLabel(t.form.from, { exact: true }).boundingBox()
        const to = await page.getByLabel(t.form.to, { exact: true }).boundingBox()
        expect(to?.y).toBeGreaterThan(from?.y ?? 0)
        await expectNoHorizontalScroll(page)
    })

    test('downloads the previewed report as a PDF', async ({ page, isMobile }) => {
        test.skip(isMobile, 'run once, at 1440 px')
        await showPreview(page)

        const download = page.waitForEvent('download')
        await page.getByRole('button', { name: t.pdf.button }).click()

        const file = await download
        expect(file.suggestedFilename()).toMatch(
            /^izvjestaj-revenue-by-zone-\d{4}-\d{2}-01-.+\.pdf$/,
        )
        const content = await readFile(await file.path(), 'latin1')
        expect(content.startsWith('%PDF-')).toBe(true)
        await expect(page.getByText(t.pdf.downloaded)).toBeVisible()
    })

    test('sends the report by e-mail after confirming', async ({ page }) => {
        await showPreview(page)

        await page.getByRole('button', { name: t.email.button }).click()
        const dialog = page.getByRole('alertdialog', { name: t.email.confirmTitle })
        await expect(dialog).toBeVisible()
        await dialog.getByRole('button', { name: t.email.confirm }).click()

        await expect(page.getByText(t.email.sent)).toBeVisible()
        await expect(dialog).toBeHidden()
        await expect(page.getByRole('button', { name: t.email.button })).toBeFocused()
    })
})
