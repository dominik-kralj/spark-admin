import { expect, test, type Locator, type Page } from '@playwright/test'

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

const t = hr.privilegedOwners
const { labels } = t.form

// The seed's newest expired entry ends on 30.09.2026, its oldest valid one on 31.12.2026.
const now = new Date('2026-10-08T10:00:00Z')

async function openList(page: Page): Promise<void> {
    await page.clock.setFixedTime(now)
    await signIn(page)
    await page.goto(paths.privilegedOwners)
}

/** Tabs from the search into the tabs, then walks them with the arrow keys. */
async function walkTabsByKeyboard(page: Page, rows: () => Locator): Promise<void> {
    await page.getByRole('searchbox', { name: t.search.label }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('tab', { name: 'Svi (6)' })).toBeFocused()

    await page.keyboard.press('ArrowRight')

    const validTab = page.getByRole('tab', { name: 'Važeći (4)' })
    await expect(validTab).toBeFocused()
    await expect(validTab).toHaveAttribute('aria-selected', 'true')
    await expect(page).toHaveURL(`${paths.privilegedOwners}?validity=valid`)
    await expect(rows()).toHaveCount(4)

    await page.keyboard.press('ArrowRight')

    await expect(page.getByRole('tab', { name: 'Istekli (2)' })).toHaveAttribute(
        'aria-selected',
        'true',
    )
    await expect(rows()).toHaveCount(2)

    await page.keyboard.press('Home')

    await expect(page.getByRole('tab', { name: 'Svi (6)' })).toHaveAttribute(
        'aria-selected',
        'true',
    )
    await expect(page).toHaveURL(paths.privilegedOwners)
}

async function fillOwner(form: Locator, values: Partial<Record<keyof typeof labels, string>>) {
    for (const [label, value] of Object.entries(values) as [keyof typeof labels, string][]) {
        await form.getByLabel(labels[label], { exact: true }).fill(value)
    }
}

/** Adds ZG777AB from `addButton`, then renews the expired ZG9087KL from `editButton`. */
async function addAndRenew(page: Page, addButton: Locator, editButton: () => Locator) {
    await addButton.click()
    const addForm = page.getByRole('dialog', { name: t.addLong })
    await expect(addForm.getByRole('heading', { name: t.addLong })).toBeFocused()
    await fillOwner(addForm, {
        plate: 'zg 777-ab',
        validUntil: '31.01.2027',
        ownerName: 'Ivana Horvat',
        street: 'Gajeva ulica',
        houseNo: '5a',
        zipCode: '10430',
        city: 'Samobor',
    })
    await addForm.getByLabel(labels.validUntil, { exact: true }).focus()
    await expect(addForm.getByLabel(labels.plate, { exact: true })).toHaveValue('ZG777AB')
    await addForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(addForm).toBeHidden()
    await expect(page.getByText(t.form.saved('ZG777AB'))).toBeVisible()

    await editButton().click()
    const editForm = page.getByRole('dialog', { name: t.editOwner('ZG9087KL') })
    await waitForAnimations(editForm)
    await expect(editForm.getByRole('status')).toContainText(t.form.expired('30.09.2026'))
    await expectNoAxeViolations(page)
    await fillOwner(editForm, { validUntil: '30.06.2027' })
    await editForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(editForm).toBeHidden()
    await expect(editButton()).toBeFocused()
}

test.describe('Privileged owners on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the table layout runs in the desktop project')

    test('filters by validity from the keyboard', async ({ page }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })

        await expect(table).toBeVisible()
        await expect(page.getByRole('list', { name: t.listLabel })).toBeHidden()
        await expect(page.getByText(t.description)).toBeVisible()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await walkTabsByKeyboard(page, () =>
            table.getByRole('row').filter({ hasNot: page.getByRole('columnheader') }),
        )
    })

    test('scrolls only the table rows when the window is short', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 480 })
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        await expect(table.getByRole('row')).toHaveCount(7)

        await expectOnlyTableScrolls(page, table)
        await expect(page.getByText('Prikazano 6 od 6')).toBeInViewport()
    })

    test('adds an entry and renews an expired one in a 560 px drawer', async ({ page }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        await expect(table).toBeVisible()

        await addAndRenew(page, page.getByRole('button', { name: t.add }), () =>
            table.getByRole('button', { name: t.editOwner('ZG9087KL') }),
        )

        await expect(table.getByRole('row', { name: /ZG777AB/ })).toContainText('31.01.2027')
        const renewed = table.getByRole('row', { name: /ZG9087KL/ })
        await expect(renewed).toContainText('30.06.2027')
        await expect(renewed).toContainText(t.status.valid)
    })
})

test.describe('Privileged owners on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of [320, 375]) {
        test(`shows cards and filters by validity from the keyboard at ${String(width)} px`, async ({
            page,
        }) => {
            await page.setViewportSize({ width, height: 812 })
            await openList(page)
            const list = page.getByRole('list', { name: t.listLabel })

            await expect(list).toBeVisible()
            await expect(page.getByRole('table')).toBeHidden()
            await expectTouchTargets(page.getByRole('tab'))
            await expectTouchTargets(page.getByRole('button', { name: t.addLong }))
            await expectTouchTargets(list.getByRole('button'))
            await expectNoHorizontalScroll(page)
            await expectNoAxeViolations(page)

            await walkTabsByKeyboard(page, () => list.getByRole('listitem'))
        })
    }

    test('adds an entry and renews an expired one in a full-screen form', async ({ page }) => {
        await openList(page)
        const list = page.getByRole('list', { name: t.listLabel })
        await expect(list).toBeVisible()

        await addAndRenew(page, page.getByRole('button', { name: t.addLong }), () =>
            list.getByRole('button', { name: t.editOwner('ZG9087KL') }),
        )

        const renewed = list.getByRole('listitem').filter({ hasText: 'ZG9087KL' })
        await expect(renewed).toContainText('30.06.2027')
        await expect(renewed).toContainText(t.status.valid)
    })
})

test.describe('Privileged owner delete', () => {
    test('deletes an entry from the table on a desktop', async ({ page, isMobile }) => {
        test.skip(isMobile, 'the table runs in the desktop project')
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })

        await table.getByRole('button', { name: t.delete.deleteOwner('ZG1234AB') }).click()
        const dialog = page.getByRole('alertdialog', { name: t.delete.title('ZG1234AB') })
        await expect(dialog.getByRole('button', { name: hr.forms.cancel })).toBeFocused()
        await waitForAnimations(dialog)
        await expectNoAxeViolations(page)
        await dialog.getByRole('button', { name: t.delete.confirm }).click()

        await expect(dialog).toBeHidden()
        await expect(page.getByText(t.delete.deleted('ZG1234AB'))).toBeVisible()
        await expect(page.getByRole('tab', { name: 'Svi (5)' })).toBeVisible()
        await expect(page.getByRole('button', { name: t.add })).toBeFocused()
    })

    test('deletes an entry from its edit form on a phone', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'the full-screen form runs in the phone project')
        await openList(page)
        const list = page.getByRole('list', { name: t.listLabel })

        await list.getByRole('button', { name: t.editOwner('ZG9087KL') }).click()
        const form = page.getByRole('dialog', { name: t.editOwner('ZG9087KL') })
        const deleteButton = form.getByRole('button', { name: t.delete.formButton })
        await expectTouchTargets(deleteButton)
        await deleteButton.click()
        await page
            .getByRole('alertdialog', { name: t.delete.title('ZG9087KL') })
            .getByRole('button', { name: t.delete.confirm })
            .click()

        await expect(form).toBeHidden()
        await expect(list.getByRole('listitem')).toHaveCount(5)
        await expect(page.getByRole('button', { name: t.addLong })).toBeFocused()
    })
})
