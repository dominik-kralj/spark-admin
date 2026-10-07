import { expect, type Locator, type Page } from '@playwright/test'

import { mockAdminCredentials } from '../src/mocks/adminUsers'
import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

export async function signIn(page: Page): Promise<void> {
    await page.goto(paths.login)
    await page.getByLabel(hr.login.username).fill(mockAdminCredentials.username)
    await page.getByLabel(hr.login.password, { exact: true }).fill(mockAdminCredentials.password)
    await page.getByRole('button', { name: hr.login.submit }).click()
    await expect(page).toHaveURL(paths.home)
}

/** Odjava sits in the header, or in the menu drawer on a phone. */
export async function signOut(page: Page): Promise<void> {
    await page.getByRole('banner').waitFor()
    const menuButton = page.getByRole('button', { name: hr.shell.openMenu })
    if (await menuButton.isVisible()) await menuButton.click()

    await page.getByRole('button', { name: hr.shell.signOut }).click()
}

/** Waits out a drawer's slide-in; axe measures contrast against the scrim mid-animation. */
export async function waitForAnimations(target: Locator): Promise<void> {
    await target.evaluate((element) =>
        Promise.all(
            element.getAnimations({ subtree: true }).map((animation) => animation.finished),
        ),
    )
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
    const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )

    expect(overflow).toBeLessThanOrEqual(0)
}

export async function expectTouchTargets(controls: Locator): Promise<void> {
    for (const control of await controls.all()) {
        const box = await control.boundingBox()
        const name = (await control.getAttribute('aria-label')) ?? (await control.innerText())

        expect(box, name).not.toBeNull()
        // Layout can land a hair under a whole pixel (43.99998).
        expect(Math.round(box?.width ?? 0), name).toBeGreaterThanOrEqual(44)
        expect(Math.round(box?.height ?? 0), name).toBeGreaterThanOrEqual(44)
    }
}
