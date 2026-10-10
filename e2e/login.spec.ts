import { expect, test, type Page } from '@playwright/test'

import { mockAdminCredentials } from '../src/mocks/adminUsers'
import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import { expectErrorMovesNothing, expectNoHorizontalScroll, zoomText } from './helpers'

test.beforeEach(async ({ page }) => {
    await page.goto(paths.login)
})

test('signs in with the mock account', async ({ page }) => {
    await expectNoAxeViolations(page)

    await page.getByLabel(hr.login.username).fill(mockAdminCredentials.username)
    await page.getByLabel(hr.login.password, { exact: true }).fill(mockAdminCredentials.password)
    await page.getByRole('button', { name: hr.login.submit }).click()

    await expect(page).toHaveURL(paths.home)
    await expect(page.getByRole('heading', { level: 1, name: hr.nav.tickets })).toBeVisible()
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

function loginControls(page: Page) {
    return [
        page.getByLabel(hr.login.username),
        page.getByLabel(hr.login.password, { exact: true }),
        page.getByRole('button', { name: hr.login.showPassword }),
        page.getByRole('button', { name: hr.login.submit }),
    ]
}

test('controls are 48 px on a touch screen and 40 px with a mouse', async ({ page, isMobile }) => {
    const height = isMobile ? 48 : 40

    for (const control of loginControls(page)) {
        expect((await control.boundingBox())?.height).toBeCloseTo(height, 0)
    }
})

test('sits in the middle of a phone screen', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the centred layout is the phone one')
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
    const submit = await page.getByRole('button', { name: hr.login.submit }).boundingBox()
    const viewportHeight = page.viewportSize()?.height ?? 0

    const above = heading?.y ?? 0
    const below = viewportHeight - (submit?.y ?? 0) - (submit?.height ?? 0)
    expect(Math.abs(above - below)).toBeLessThan(24)
})

test('a mouse keeps 40 px controls in a narrow window', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse sizing runs in the desktop project')
    await page.setViewportSize({ width: 800, height: 900 })

    for (const control of loginControls(page)) {
        expect((await control.boundingBox())?.height).toBeCloseTo(40, 0)
    }
})

test('holds at 320 px with 200 % text zoom', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the narrow phone width runs in the phone project')
    await page.setViewportSize({ width: 320, height: 812 })
    await page.getByRole('heading', { level: 1 }).waitFor()

    await zoomText(page)

    await expectNoHorizontalScroll(page)
    await expect(page.getByRole('button', { name: hr.login.submit })).toBeInViewport()
})

test('shows a message under an empty field without moving the form', async ({ page }) => {
    await expectErrorMovesNothing(page, {
        field: page.getByLabel(hr.login.username),
        value: '',
        steady: [
            page.getByLabel(hr.login.password, { exact: true }),
            page.getByRole('button', { name: hr.login.submit }),
        ],
    })

    await expect(page.getByText(hr.login.usernameRequired)).toBeVisible()
    await expectNoAxeViolations(page)
})
