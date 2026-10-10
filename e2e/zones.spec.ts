import { expect, test, type Locator, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectErrorMovesNothing,
    expectBelow,
    expectNoHorizontalScroll,
    expectOnlyTableScrolls,
    expectTouchTargets,
    signIn,
    waitForAnimations,
} from './helpers'

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

test('scrolls only the table rows when the window is short', async ({ page, isMobile }) => {
    test.skip(isMobile, 'the table layout runs in the desktop project')
    await page.setViewportSize({ width: 1440, height: 360 })
    await signIn(page)
    await page.goto(paths.zones)
    const table = page.getByRole('table', { name: hr.zones.listLabel })
    await expect(table.getByRole('row')).toHaveCount(3)

    await expectOnlyTableScrolls(page, table)
    await expect(page.getByText(hr.zones.total(2))).toBeInViewport()
})

test.describe('Zone list cache', () => {
    test.skip(({ isMobile }) => isMobile, 'one browser is enough for the cache')

    test('comes back from the cache within a minute, without asking again', async ({ page }) => {
        let zoneRequests = 0
        page.on('request', (request) => {
            if (new URL(request.url()).pathname.endsWith('/zones')) zoneRequests += 1
        })
        await signIn(page)
        await page.goto(paths.zones)
        await expect(page.getByRole('table', { name: hr.zones.listLabel })).toBeVisible()
        const firstVisit = zoneRequests

        await page.getByRole('link', { name: hr.nav.inspectors }).click()
        await expect(page.getByRole('heading', { level: 1, name: hr.nav.inspectors })).toBeVisible()
        await page.getByRole('link', { name: hr.nav.zones }).click()

        await expect(page.getByRole('table', { name: hr.zones.listLabel })).toBeVisible()
        expect(zoneRequests).toBe(firstVisit)
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

const { labels } = hr.zones.form

const newZone: Record<keyof typeof labels, string> = {
    code: 'ZONA3',
    name: 'Treća zona',
    price: '0,70',
    dailyTicketPrice: '15.5',
    durationMinutes: '45',
    maxExtensions: '1',
    dpkIssueDelayMinutes: '10',
}

async function fillZone(form: Locator, values: Record<keyof typeof labels, string>) {
    for (const [label, value] of Object.entries(values) as [keyof typeof labels, string][]) {
        await form.getByLabel(labels[label], { exact: true }).fill(value)
    }
}

/** Adds ZONA3, then opens it again from `editButton` and renames it. */
async function addAndEditZone(page: Page, editButton: () => Locator) {
    await page.getByRole('button', { name: hr.zones.add }).click()
    const addForm = page.getByRole('dialog', { name: hr.zones.add })
    await expect(addForm.getByRole('heading', { name: hr.zones.add })).toBeFocused()
    await fillZone(addForm, newZone)
    await addForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(addForm).toBeHidden()
    await expect(page.getByText(hr.zones.form.saved('ZONA3'))).toBeVisible()

    await editButton().click()
    const editForm = page.getByRole('dialog', { name: hr.zones.editZone('ZONA3') })
    await expect(editForm.getByLabel(labels.price, { exact: true })).toHaveValue('0,70')
    await expect(editForm.getByLabel(labels.dailyTicketPrice, { exact: true })).toHaveValue('15,50')
    await editForm.getByLabel(labels.name, { exact: true }).fill('Treća zona B')
    await editForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(editForm).toBeHidden()
    await expect(editButton()).toBeFocused()
}

test.describe('Zone form on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the drawer layout runs in the desktop project')

    test('adds and edits a zone in a 560 px drawer', async ({ page }) => {
        await signIn(page)
        await page.goto(paths.zones)
        const table = page.getByRole('table', { name: hr.zones.listLabel })
        await expect(table).toBeVisible()

        await page.getByRole('button', { name: hr.zones.add }).click()
        const form = page.getByRole('dialog', { name: hr.zones.add })
        await waitForAnimations(form)
        expect((await form.boundingBox())?.width).toBe(560)
        await expectNoAxeViolations(page)
        await form.getByRole('button', { name: hr.forms.close }).click()
        await expect(form).toBeHidden()

        await addAndEditZone(page, () =>
            table.getByRole('button', { name: hr.zones.editZone('ZONA3') }),
        )

        await expect(table.getByRole('row', { name: /ZONA3/ })).toContainText('Treća zona B')
        await expect(table.getByRole('row', { name: /ZONA3/ })).toContainText('15,50 EUR')
    })
})

test.describe('Zone form on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    test('adds and edits a zone in a full-screen form', async ({ page }) => {
        await signIn(page)
        await page.goto(paths.zones)
        const list = page.getByRole('list', { name: hr.zones.listLabel })
        await expect(list).toBeVisible()

        await page.getByRole('button', { name: hr.zones.add }).click()
        const form = page.getByRole('dialog', { name: hr.zones.add })
        await waitForAnimations(form)
        expect((await form.boundingBox())?.width).toBe(375)
        await expectTouchTargets(form.getByRole('textbox'))
        await expectTouchTargets(form.getByRole('button'))
        await expectBelow(
            form.getByRole('button', { name: hr.forms.cancel }),
            form.getByRole('button', { name: hr.forms.save }),
        )
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)
        await form.getByRole('button', { name: hr.forms.close }).click()
        await expect(form).toBeHidden()

        await addAndEditZone(page, () =>
            list.getByRole('button', { name: hr.zones.editZone('ZONA3') }),
        )

        await expect(list.getByRole('listitem').filter({ hasText: 'ZONA3' })).toContainText(
            'Treća zona B',
        )
    })
})

test.describe('Zone form errors', () => {
    test('shows a message under its field without moving the form', async ({ page }) => {
        await signIn(page)
        await page.goto(paths.zones)
        await page.getByRole('button', { name: hr.zones.add }).click()
        const form = page.getByRole('dialog', { name: hr.zones.add })
        await waitForAnimations(form)
        const field = (label: keyof typeof labels) =>
            form.getByLabel(labels[label], { exact: true })

        await expectErrorMovesNothing(page, {
            field: field('price'),
            value: '1,2,3',
            steady: [
                field('dailyTicketPrice'),
                field('durationMinutes'),
                form.getByRole('button', { name: hr.forms.save }),
            ],
        })

        await expect(form).toContainText(hr.zones.form.errors.notAmount)
        await expectNoAxeViolations(page)
    })
})

test.describe('Zone delete', () => {
    test('deletes a zone from the table on a desktop', async ({ page, isMobile }) => {
        test.skip(isMobile, 'the table runs in the desktop project')
        await signIn(page)
        await page.goto(paths.zones)
        const table = page.getByRole('table', { name: hr.zones.listLabel })

        await table.getByRole('button', { name: hr.zones.delete.deleteZone('ZONA1') }).click()
        const dialog = page.getByRole('alertdialog', { name: hr.zones.delete.title('ZONA1') })
        await expect(dialog.getByRole('button', { name: hr.forms.cancel })).toBeFocused()
        await waitForAnimations(dialog)
        await expectNoAxeViolations(page)
        await dialog.getByRole('button', { name: hr.zones.delete.confirm }).click()

        await expect(dialog).toBeHidden()
        await expect(page.getByText(hr.zones.delete.deleted('ZONA1'))).toBeVisible()
        await expect(table.getByRole('row')).toHaveCount(2)
        await expect(page.getByRole('button', { name: hr.zones.add })).toBeFocused()
    })

    test('deletes a zone from its card on a phone', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'cards run in the phone project')
        await signIn(page)
        await page.goto(paths.zones)
        const list = page.getByRole('list', { name: hr.zones.listLabel })
        const deleteButton = list.getByRole('button', { name: hr.zones.delete.deleteZone('2A') })

        await expectTouchTargets(deleteButton)
        await deleteButton.click()
        const dialog = page.getByRole('alertdialog', { name: hr.zones.delete.title('2A') })
        await waitForAnimations(dialog)
        await expectNoAxeViolations(page)
        await dialog.getByRole('button', { name: hr.zones.delete.confirm }).click()

        await expect(list.getByRole('listitem')).toHaveCount(1)
        await expect(page.getByRole('button', { name: hr.zones.add })).toBeFocused()
    })

    test('deletes a zone from its edit form on a phone', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'the full-screen form runs in the phone project')
        await signIn(page)
        await page.goto(paths.zones)
        const list = page.getByRole('list', { name: hr.zones.listLabel })

        await list.getByRole('button', { name: hr.zones.editZone('ZONA1') }).click()
        const form = page.getByRole('dialog', { name: hr.zones.editZone('ZONA1') })
        const deleteButton = form.getByRole('button', { name: hr.zones.delete.formButton })
        await expectBelow(deleteButton, form.getByRole('button', { name: hr.forms.cancel }))
        await expectTouchTargets(deleteButton)
        await deleteButton.click()
        const dialog = page.getByRole('alertdialog', { name: hr.zones.delete.title('ZONA1') })
        const confirm = dialog.getByRole('button', { name: hr.zones.delete.confirm })
        await expectBelow(dialog.getByRole('button', { name: hr.forms.cancel }), confirm)
        await confirm.click()

        await expect(form).toBeHidden()
        await expect(list.getByRole('listitem')).toHaveCount(1)
        await expect(page.getByText(hr.zones.delete.deleted('ZONA1'))).toBeVisible()
    })
})
