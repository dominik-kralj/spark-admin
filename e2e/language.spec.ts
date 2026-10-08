import { expect, test } from '@playwright/test'

import { en } from '../src/shared/i18n/en'
import { hr } from '../src/shared/i18n/hr'
import { languagePickerLabel } from '../src/shared/i18n/language'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectBelow,
    expectNoHorizontalScroll,
    expectTouchTargets,
    signIn,
    waitForAnimations,
} from './helpers'

test.describe('language on a desktop', () => {
    test.skip(({ isMobile }) => isMobile, 'the header picker runs in the desktop project')

    test('switches to English from the keyboard and keeps it after a reload', async ({ page }) => {
        await signIn(page)
        await page.goto(paths.zones)
        const picker = page.getByRole('button', { name: `${languagePickerLabel}: Hrvatski` })

        await picker.focus()
        await page.keyboard.press('Enter')
        // The menu highlights items rather than moving DOM focus to them.
        await expect(page.getByRole('menuitemradio', { name: 'Hrvatski' })).toHaveAttribute(
            'data-highlighted',
        )
        await page.keyboard.press('ArrowDown')
        await page.keyboard.press('Enter')

        await expect(page.getByRole('heading', { level: 1, name: en.nav.zones })).toBeVisible()
        await expect(page.locator('html')).toHaveAttribute('lang', 'en')
        await expect(page).toHaveTitle('Zones – SPARK Admin')
        await expect(
            page.getByRole('button', { name: `${languagePickerLabel}: English` }),
        ).toBeFocused()
        await expectNoAxeViolations(page)

        await page.reload()

        await expect(page.getByRole('heading', { level: 1, name: en.nav.zones })).toBeVisible()
    })
})

test.describe('language on a scaled laptop', () => {
    test.skip(({ isMobile }) => isMobile, 'a mouse layout; runs in the desktop project')

    // 1280 × 720 at 150 % Windows scaling, less the browser bar: the tablet rail.
    test('keeps the rail free of a scrollbar, with the menu in its expanded drawer', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 853, height: 560 })
        await signIn(page)
        const nav = page.getByRole('navigation', { name: hr.shell.mainNav })

        const overflow = await nav.evaluate(
            (element) => element.scrollHeight - element.clientHeight,
        )
        expect(overflow).toBeLessThanOrEqual(0)

        await page.getByRole('button', { name: hr.shell.expandMenu }).click()
        await expect(
            page
                .getByRole('dialog', { name: hr.shell.menu })
                .getByRole('button', { name: `${languagePickerLabel}: Hrvatski` }),
        ).toBeVisible()
    })
})

test.describe('language on a phone', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    test('switches from a full-width row in the menu drawer', async ({ page }) => {
        await signIn(page)
        await page.getByRole('button', { name: hr.shell.openMenu }).click()
        const drawer = page.getByRole('dialog', { name: hr.shell.menu })
        await waitForAnimations(drawer)
        const picker = drawer.getByRole('button', { name: `${languagePickerLabel}: Hrvatski` })

        await expectTouchTargets(picker)
        await expectBelow(drawer.getByRole('button', { name: hr.shell.signOut }), picker)
        await picker.click()
        await page.getByRole('menuitemradio', { name: 'English' }).click()
        // The drawer is renamed too, so find it again by its English name.
        const englishDrawer = page.getByRole('dialog', { name: en.shell.menu })
        await expect(englishDrawer.getByRole('button', { name: en.shell.signOut })).toBeVisible()
        await expectNoAxeViolations(page)
    })

    test('can be switched on the login page at 320 px', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 })
        await page.goto(paths.login)
        const picker = page.getByRole('button', { name: `${languagePickerLabel}: HR` })

        await expectTouchTargets(picker)
        await expectBelow(page.getByRole('heading', { level: 1 }), picker)
        await expectNoHorizontalScroll(page)
        await picker.click()
        await page.getByRole('menuitemradio', { name: 'English' }).click()

        await expect(page.getByRole('button', { name: en.login.submit })).toBeVisible()
        await expectNoAxeViolations(page)
    })
})
