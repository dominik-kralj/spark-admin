import { expect, type Locator, type Page } from '@playwright/test'

import { mockAdminCredentials } from '../src/mocks/adminAccount'
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

/** 200 % text zoom: the browser setting scales the root font size, not the viewport. */
export async function zoomText(page: Page): Promise<void> {
    await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%'
    })
}

/** Tabs a few times past the end and checks focus never leaves the dialog. */
export async function expectFocusTrapped(page: Page, dialog: Locator): Promise<void> {
    const stops = await dialog.locator('a, button').count()

    for (let i = 0; i < stops + 3; i += 1) {
        await page.keyboard.press('Tab')
        await expect(dialog.locator(':focus')).toHaveCount(1)
    }
}

/** `lower` starts below where `upper` ends, so the two never overlap. */
export async function expectBelow(lower: Locator, upper: Locator): Promise<void> {
    const lowerBox = await lower.boundingBox()
    const upperBox = await upper.boundingBox()

    expect(lowerBox?.y).toBeGreaterThanOrEqual((upperBox?.y ?? 0) + (upperBox?.height ?? 0))
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
        expect(box?.width, name).toBeGreaterThanOrEqual(43.99)
        expect(box?.height, name).toBeGreaterThanOrEqual(43.99)
    }
}

/** The page fits the window, and `table` scrolls its own rows instead. */
export async function expectOnlyTableScrolls(page: Page, table: Locator): Promise<void> {
    const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
    )
    const main = page.getByRole('main')
    const mainOverflow = await main.evaluate(
        (element) => element.scrollHeight - element.clientHeight,
    )
    const rowsOverflow = await table
        .locator('..')
        .evaluate((element) => element.scrollHeight - element.clientHeight)

    expect(pageOverflow).toBeLessThanOrEqual(0)
    expect(mainOverflow).toBeLessThanOrEqual(0)
    expect(rowsOverflow).toBeGreaterThan(0)

    const scrollArea = table.locator('..')
    const headerTop = async () => (await table.getByRole('columnheader').first().boundingBox())?.y
    const areaTop = (await scrollArea.boundingBox())?.y
    await scrollArea.evaluate((element) => {
        element.scrollTop = element.scrollHeight
    })

    expect(await headerTop()).toBeCloseTo(areaTop ?? Number.NaN, 0)
}

/** Every field message keeps to its one reserved line (textStyle xs: 1rem). */
export async function expectOneLineErrors(page: Page): Promise<void> {
    for (const message of await page.locator('[data-part="error-text"]').all()) {
        const height = (await message.boundingBox())?.height
        expect(height, await message.innerText()).toBeLessThanOrEqual(16)
    }
}

interface ErrorMovesNothingArgs {
    field: Locator
    value: string
    /** What must stay put: the next field, the Save button. */
    steady: Locator[]
}

/** Fills `field` and leaves it, so its message shows, without moving anything around it. */
export async function expectErrorMovesNothing(
    page: Page,
    { field, value, steady }: ErrorMovesNothingArgs,
): Promise<void> {
    await field.fill(value)
    const before = await Promise.all(steady.map((control) => control.boundingBox()))

    await field.blur()

    await expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(await Promise.all(steady.map((control) => control.boundingBox()))).toEqual(before)
    await expectOneLineErrors(page)
}
