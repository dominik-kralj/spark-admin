import { expect, test, type Locator, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectBelow,
    expectNoHorizontalScroll,
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
