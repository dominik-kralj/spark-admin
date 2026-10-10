import { expect, test, type Locator, type Page } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectBelow,
    expectErrorMovesNothing,
    expectNoHorizontalScroll,
    expectTouchTargets,
    signIn,
    waitForAnimations,
} from './helpers'

const t = hr.adminUsers
const { labels } = t.form

async function openList(page: Page): Promise<void> {
    await signIn(page)
    await page.goto(paths.adminUsers)
}

test.describe('Admin user list on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the table layout runs in the desktop project')

    test('shows the table with the signed-in user marked, sorts from the keyboard', async ({
        page,
    }) => {
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        const usernameHeader = table.getByRole('columnheader', { name: t.columns.username })

        await expect(table).toBeVisible()
        await expect(page.getByRole('list', { name: t.listLabel })).toBeHidden()
        await expect(table.getByRole('row')).toHaveCount(4)
        await expect(table.getByRole('row', { name: /admin/ })).toContainText(t.you)
        await expect(page.getByText(t.total(3))).toBeVisible()
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)

        await usernameHeader.getByRole('button').focus()
        await page.keyboard.press('Enter')

        await expect(usernameHeader).toHaveAttribute('aria-sort', 'descending')
        await expect(page).toHaveURL(`${paths.adminUsers}?sort=username&dir=desc`)
        await expect(table.getByRole('row').nth(1)).toContainText('sanja.klaric')
    })
})

test.describe('Admin user list on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of [320, 375]) {
        test(`shows one card per user at ${String(width)} px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 })
            await openList(page)
            const list = page.getByRole('list', { name: t.listLabel })

            await expect(list).toBeVisible()
            await expect(list.getByRole('listitem')).toHaveCount(3)
            await expect(list.getByRole('listitem').first()).toContainText(t.you)
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

/** Adds iva.maric, then renames marin.loncar and gives him a new password from `editButton`. */
async function addAndEdit(page: Page, editButton: (username: string) => Locator) {
    await page.getByRole('button', { name: t.add }).locator('visible=true').click()
    const addForm = page.getByRole('dialog', { name: t.add })
    await expect(addForm.getByRole('heading', { name: t.add })).toBeFocused()
    await addForm.getByLabel(labels.username, { exact: true }).fill('iva.maric')
    await addForm.getByLabel(labels.name, { exact: true }).fill('Iva')
    await addForm.getByLabel(labels.surname, { exact: true }).fill('Marić')
    const password = addForm.getByLabel(labels.password, { exact: true })
    await expect(password).toHaveAttribute('autocomplete', 'new-password')
    await password.fill('lozinka123')
    await addForm.getByLabel(labels.confirmPassword, { exact: true }).fill('lozinka123')
    await addForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(addForm).toBeHidden()
    await expect(page.getByText(t.form.saved('iva.maric'))).toBeVisible()

    await editButton('marin.loncar').click()
    const editForm = page.getByRole('dialog', { name: t.editAdminUser('marin.loncar') })
    await waitForAnimations(editForm)
    await expect(editForm.getByLabel(labels.username, { exact: true })).toHaveAttribute('readonly')
    const newPassword = editForm.getByLabel(labels.newPassword, { exact: true })
    await expect(newPassword).toHaveValue('')
    await editForm.getByLabel(labels.surname, { exact: true }).fill('Lončar-Horvat')
    await newPassword.fill('nova-lozinka')
    await editForm.getByLabel(labels.confirmNewPassword, { exact: true }).fill('nova-lozinka')
    await editForm.getByRole('button', { name: t.form.showPassword }).click()
    await expect(newPassword).toHaveAttribute('type', 'text')
    await expectNoAxeViolations(page)
    await editForm.getByRole('button', { name: hr.forms.save }).click()

    await expect(editForm).toBeHidden()
    await expect(editButton('marin.loncar')).toBeFocused()
}

test.describe('Admin user form on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the drawer layout runs in the desktop project')

    test('adds one user and edits another in a 560 px drawer', async ({ page }) => {
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

        await addAndEdit(page, (username) =>
            table.getByRole('button', { name: t.editAdminUser(username) }),
        )

        await expect(table.getByRole('row', { name: /iva\.maric/ })).toContainText('Iva Marić')
        await expect(table.getByRole('row', { name: /marin\.loncar/ })).toContainText(
            'Marin Lončar-Horvat',
        )
        await expect(page.getByText(t.total(4))).toBeVisible()
    })
})

test.describe('Admin user form on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    test('adds one user and edits another in a full-screen form', async ({ page }) => {
        await openList(page)
        const list = page.getByRole('list', { name: t.listLabel })
        await expect(list).toBeVisible()

        await page.getByRole('button', { name: t.add }).locator('visible=true').click()
        const form = page.getByRole('dialog', { name: t.add })
        await waitForAnimations(form)
        expect((await form.boundingBox())?.width).toBe(375)
        await expectTouchTargets(form.getByRole('textbox'))
        await expectTouchTargets(form.getByLabel(labels.password, { exact: true }))
        await expectTouchTargets(form.getByRole('button'))
        await expectBelow(
            form.getByRole('button', { name: hr.forms.cancel }),
            form.getByRole('button', { name: hr.forms.save }),
        )
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)
        await form.getByRole('button', { name: hr.forms.close }).click()
        await expect(form).toBeHidden()

        await addAndEdit(page, (username) =>
            list.getByRole('button', { name: t.editAdminUser(username) }),
        )

        await expect(list.getByRole('listitem').filter({ hasText: 'marin.loncar' })).toContainText(
            'Marin Lončar-Horvat',
        )
    })

    test('asks before discarding changes', async ({ page }) => {
        await openList(page)
        const list = page.getByRole('list', { name: t.listLabel })
        await list.getByRole('button', { name: t.editAdminUser('marin.loncar') }).click()
        const form = page.getByRole('dialog', { name: t.editAdminUser('marin.loncar') })
        await waitForAnimations(form)
        await form.getByLabel(labels.name, { exact: true }).fill('Marino')

        await form.getByRole('button', { name: hr.forms.close }).click()

        const dialog = page.getByRole('alertdialog', { name: hr.forms.discard.title })
        await expect(
            dialog.getByRole('button', { name: hr.forms.discard.keepEditing }),
        ).toBeFocused()
        await waitForAnimations(dialog)
        await expectNoAxeViolations(page)
        await dialog.getByRole('button', { name: hr.forms.discard.confirm }).click()
        await expect(form).toBeHidden()
        await expect(list.getByRole('listitem').filter({ hasText: 'marin.loncar' })).toContainText(
            'Marin Lončar',
        )
    })
})

test.describe('Admin user delete', () => {
    test('deletes from the row on a desktop, never the signed-in user', async ({
        page,
        isMobile,
    }) => {
        test.skip(isMobile, 'the table layout runs in the desktop project')
        await openList(page)
        const table = page.getByRole('table', { name: t.listLabel })
        await expect(table).toBeVisible()
        await expect(table.getByRole('button', { name: /^Obriši korisnika / })).toHaveCount(2)

        await table.getByRole('button', { name: t.delete.deleteAdminUser('marin.loncar') }).click()
        const dialog = page.getByRole('alertdialog', { name: t.delete.title('marin.loncar') })
        await expect(dialog.getByRole('button', { name: hr.forms.cancel })).toBeFocused()
        await waitForAnimations(dialog)
        await expectNoAxeViolations(page)
        await dialog.getByRole('button', { name: t.delete.confirm }).click()

        await expect(dialog).toBeHidden()
        await expect(table.getByRole('row')).toHaveCount(3)
        await expect(page.getByText(t.delete.deleted('marin.loncar'))).toBeVisible()
        await expect(
            page.getByRole('button', { name: t.add }).locator('visible=true'),
        ).toBeFocused()
    })

    test('deletes from the edit form on a phone', async ({ page, isMobile }) => {
        test.skip(!isMobile, 'touch layouts run in the phone project')
        await openList(page)
        const list = page.getByRole('list', { name: t.listLabel })
        await list.getByRole('button', { name: t.editAdminUser('sanja.klaric') }).click()
        const form = page.getByRole('dialog', { name: t.editAdminUser('sanja.klaric') })
        await waitForAnimations(form)
        await expectTouchTargets(form.getByRole('button', { name: t.delete.formButton }))

        await form.getByRole('button', { name: t.delete.formButton }).click()
        const dialog = page.getByRole('alertdialog', { name: t.delete.title('sanja.klaric') })
        await waitForAnimations(dialog)
        await dialog.getByRole('button', { name: t.delete.confirm }).click()

        await expect(form).toBeHidden()
        await expect(list.getByRole('listitem')).toHaveCount(2)
        await expect(
            page.getByRole('button', { name: t.add }).locator('visible=true'),
        ).toBeFocused()
    })
})

test.describe('Admin user form errors', () => {
    test('shows a message under its field without moving the form', async ({ page }) => {
        await openList(page)
        await page.getByRole('button', { name: t.add }).first().click()
        const form = page.getByRole('dialog', { name: t.add })
        await waitForAnimations(form)

        await expectErrorMovesNothing(page, {
            field: form.getByLabel(labels.username, { exact: true }),
            value: '',
            steady: [
                form.getByLabel(labels.name, { exact: true }),
                form.getByRole('button', { name: hr.forms.save }),
            ],
        })

        await expect(form).toContainText(hr.forms.validation.required)
        await expectNoAxeViolations(page)
    })
})
