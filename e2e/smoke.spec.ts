import { expect, test } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'

import { expectNoAxeViolations } from './axe'

test('the app loads on the mock API with no axe violations', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1, name: hr.app.name })).toBeVisible()
    expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)

    await expectNoAxeViolations(page)
})
