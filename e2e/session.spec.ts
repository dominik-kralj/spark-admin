import { expect, test } from '@playwright/test'

import { mockAdminCredentials } from '../src/mocks/adminUsers'
import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import { signOut } from './shell'

const missingPath = '/nema-ove-stranice'

test('signs in to the requested page, survives a reload, and signs out for good', async ({
    page,
}) => {
    await page.goto(missingPath)
    await expect(page).toHaveURL(/\/prijava\?next=/)

    await page.getByLabel(hr.login.username).fill(mockAdminCredentials.username)
    await page.getByLabel(hr.login.password, { exact: true }).fill(mockAdminCredentials.password)
    await page.getByRole('button', { name: hr.login.submit }).click()

    await expect(page).toHaveURL(missingPath)
    await expect(page.getByRole('heading', { level: 1, name: hr.notFound.title })).toBeVisible()
    await expectNoAxeViolations(page)

    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: hr.notFound.title })).toBeVisible()

    await page.getByRole('link', { name: hr.notFound.home }).click()
    await signOut(page)
    await expect(page).toHaveURL(paths.login)

    await page.goBack()
    await expect(page).toHaveURL(/\/prijava/)
    await expect(page.getByRole('button', { name: hr.shell.signOut })).toBeHidden()
})
