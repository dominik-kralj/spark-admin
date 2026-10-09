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

const t = hr.inspectors
const { labels } = t.form

async function openList(page: Page): Promise<void> {
    await signIn(page)
    await page.goto(paths.inspectors)
}

test.describe('Inspector list on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the table layout runs in the desktop project')

    test('shows the table with status as text, sorts by Prezime from the keyboard', async ({
        page,
    }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        const surnameHeader = table.getByRole('columnheader', { name: t.columns.surname })

        await expect(table).toBeVisible()
        await expect(page.getByRole('list', { name: t.listLabel })).toBeHidden()
        await expect(table.getByRole('row')).toHaveCount(4)
        await expect(table.getByRole('row', { name: /Šimić/ })).toContainText(t.status.inactive)
        await expect(page.getByText(t.total(3, 2))).toBeVisible()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await surnameHeader.getByRole('button').focus()
        await page.keyboard.press('Enter')

        await expect(surnameHeader).toHaveAttribute('aria-sort', 'descending')
        await expect(page).toHaveURL(`${paths.inspectors}?sort=surname&dir=desc`)
        await expect(table.getByRole('row').nth(1)).toContainText('Šimić')
    })
})

test.describe('Inspector list on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of [320, 375]) {
        test(`shows one card per inspector at ${String(width)} px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 })
            await openList(page)
            const list = page.getByRole('list', { name: t.listLabel })

            await expect(list).toBeVisible()
            await expect(list.getByRole('listitem')).toHaveCount(3)
            await expect(page.getByRole('table')).toBeHidden()
            await expectTouchTargets(
                page.getByRole('button', { name: t.add }).locator('visible=true'),
            )
            await expectTouchTargets(list.getByRole('button'))
            await expectNoHorizontalScroll(page)
            await expectNoAxeViolations(page)
        })
    }
})

/** Adds Ivana Kos, then deactivates Marko Horvat from `editButton`, confirming in the dialog. */
async function addAndDeactivate(page: Page, editButton: (name: string) => Locator) {
    await page.getByRole('button', { name: t.add }).locator('visible=true').click()
    const addForm = page.getByRole('dialog', { name: t.add })
    await expect(addForm.getByRole('heading', { name: t.add })).toBeFocused()
    await addForm.getByLabel(labels.name, { exact: true }).fill('Ivana')
    await addForm.getByLabel(labels.surname, { exact: true }).fill('Kos')
    await addForm.getByLabel(labels.oib, { exact: true }).fill('56789012345')
    await addForm.getByLabel(labels.pin, { exact: true }).pressSequentially('04x20')
    await expect(addForm.getByLabel(labels.pin, { exact: true })).toHaveValue('0420')
    await addForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(addForm).toBeHidden()
    await expect(page.getByText(t.form.saved('Ivana Kos'))).toBeVisible()

    await editButton('Marko Horvat').click()
    const editForm = page.getByRole('dialog', { name: t.editInspector('Marko Horvat') })
    const pin = editForm.getByLabel(labels.pin, { exact: true })
    await expect(pin).toHaveValue('1234')
    await expect(pin).toHaveAttribute('type', 'password')
    const activeSwitch = editForm.getByRole('switch', { name: labels.isActive })
    await expect(activeSwitch).toBeChecked()
    await waitForAnimations(editForm)
    await activeSwitch.focus()
    await page.keyboard.press('Space')

    const dialog = page.getByRole('alertdialog', { name: t.deactivate.title('Marko Horvat') })
    await expect(dialog.getByRole('button', { name: hr.forms.cancel })).toBeFocused()
    await waitForAnimations(dialog)
    await expectNoAxeViolations(page)
    await dialog.getByRole('button', { name: t.deactivate.confirm }).click()

    await expect(dialog).toBeHidden()
    await expect(activeSwitch).not.toBeChecked()
    await expect(editForm.getByText(t.form.no, { exact: true })).toBeVisible()
    await editForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(editForm).toBeHidden()
    await expect(editButton('Marko Horvat')).toBeFocused()
}

test.describe('Inspector form on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the drawer layout runs in the desktop project')

    test('adds one inspector and deactivates another in a 560 px drawer', async ({ page }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        await expect(table).toBeVisible()

        await page.getByRole('button', { name: t.add }).locator('visible=true').click()
        const form = page.getByRole('dialog', { name: t.add })
        await waitForAnimations(form)
        expect((await form.boundingBox())?.width).toBe(560)
        await expectNoAxeViolations(page)
        await form.getByRole('button', { name: hr.forms.close }).click()
        await expect(form).toBeHidden()

        await addAndDeactivate(page, (name) =>
            table.getByRole('button', { name: t.editInspector(name) }),
        )

        await expect(table.getByRole('row', { name: /Kos/ })).toContainText(t.status.active)
        await expect(table.getByRole('row', { name: /Horvat/ })).toContainText(t.status.inactive)
        await expect(page.getByText(t.total(4, 2))).toBeVisible()
    })
})

test.describe('Inspector form on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    test('adds one inspector and deactivates another in a full-screen form', async ({ page }) => {
        await openList(page)
        const list = page.getByRole('list', { name: t.listLabel })
        await expect(list).toBeVisible()

        await page.getByRole('button', { name: t.add }).locator('visible=true').click()
        const form = page.getByRole('dialog', { name: t.add })
        await waitForAnimations(form)
        expect((await form.boundingBox())?.width).toBe(375)
        await expectTouchTargets(form.getByRole('textbox'))
        await expectTouchTargets(form.getByLabel(labels.pin, { exact: true }))
        await expectTouchTargets(form.getByRole('button'))
        await expectBelow(
            form.getByRole('button', { name: hr.forms.cancel }),
            form.getByRole('button', { name: hr.forms.save }),
        )
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)
        await form.getByRole('button', { name: hr.forms.close }).click()
        await expect(form).toBeHidden()

        await addAndDeactivate(page, (name) =>
            list.getByRole('button', { name: t.editInspector(name) }),
        )

        await expect(list.getByRole('listitem').filter({ hasText: 'Marko Horvat' })).toContainText(
            t.status.inactive,
        )
    })
})
