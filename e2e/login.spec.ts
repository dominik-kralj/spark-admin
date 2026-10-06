import { expect, test } from '@playwright/test'

import { mockAdminCredentials } from '../src/mocks/adminUsers'
import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'

test.beforeEach(async ({ page }) => {
    await page.goto(paths.login)
})

test('signs in with the mock account', async ({ page }) => {
    await expectNoAxeViolations(page)

    await page.getByLabel(hr.login.username).fill(mockAdminCredentials.username)
    await page.getByLabel(hr.login.password, { exact: true }).fill(mockAdminCredentials.password)
    await page.getByRole('button', { name: hr.login.submit }).click()

    await expect(page).toHaveURL(paths.home)
    await expect(page.getByRole('heading', { level: 1, name: hr.app.name })).toBeVisible()
})

test('moves focus to the error after a wrong password and keeps the values', async ({ page }) => {
    await page.getByLabel(hr.login.username).fill(mockAdminCredentials.username)
    await page.getByLabel(hr.login.password, { exact: true }).fill('kriva')
    await page.getByLabel(hr.login.password, { exact: true }).press('Enter')

    const alert = page.getByRole('alert')
    await expect(alert).toContainText(hr.login.errors.unauthorized)
    await expect(alert).toBeFocused()
    await expect(page.getByLabel(hr.login.username)).toHaveValue(mockAdminCredentials.username)
    await expect(page).toHaveURL(paths.login)
    await expectNoAxeViolations(page)
})

test('controls meet the touch target size for the width', async ({ page, isMobile }) => {
    const minHeight = isMobile ? 48 : 44
    const controls = [
        page.getByLabel(hr.login.username),
        page.getByLabel(hr.login.password, { exact: true }),
        page.getByRole('button', { name: hr.login.showPassword }),
        page.getByRole('button', { name: hr.login.submit }),
    ]

    for (const control of controls) {
        const box = await control.boundingBox()
        expect(box?.height).toBeGreaterThanOrEqual(minHeight)
    }
})
