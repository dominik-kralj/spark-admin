import { expect, test } from '@playwright/test'

import { hr } from '../src/shared/i18n/hr'
import { paths } from '../src/shared/paths'

import { expectNoAxeViolations } from './axe'
import {
    expectBelow,
    expectFocusTrapped,
    expectNoHorizontalScroll,
    expectTouchTargets,
    signIn,
    waitForAnimations,
    zoomText,
} from './helpers'

// 640 px is a 1280 px screen at 200 % page zoom.
const phoneWidths = [320, 375, 640]

test.describe('phone menu drawer', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    for (const width of phoneWidths) {
        test(`works by keyboard and touch at ${width} px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 812 })
            await signIn(page)
            const menuButton = page.getByRole('button', { name: hr.shell.openMenu })
            const drawer = page.getByRole('dialog', { name: hr.shell.menu })

            await expectNoHorizontalScroll(page)
            await expectTouchTargets(menuButton)
            await expectNoAxeViolations(page)

            await page.keyboard.press('Tab')
            await expect(page.getByRole('link', { name: hr.shell.skipToContent })).toBeFocused()
            await page.keyboard.press('Tab')
            await expect(menuButton).toBeFocused()
            await page.keyboard.press('Enter')

            await expect(drawer).toBeVisible()
            await waitForAnimations(drawer)
            await expectTouchTargets(drawer.getByRole('link'))
            await expectTouchTargets(drawer.getByRole('button'))
            await expectBelow(
                drawer.getByRole('link', { name: hr.nav.tickets }),
                drawer.getByRole('button', { name: hr.shell.closeMenu }),
            )
            await expectNoHorizontalScroll(page)
            await expectNoAxeViolations(page)
            await expectFocusTrapped(page, drawer)

            await page.keyboard.press('Escape')
            await expect(drawer).toBeHidden()
            await expect(menuButton).toBeFocused()

            await page.keyboard.press('Enter')
            await expect(drawer).toBeVisible()
            const zonesLink = drawer.getByRole('link', { name: hr.nav.zones })
            while (!(await zonesLink.evaluate((link) => link === document.activeElement))) {
                await page.keyboard.press('Tab')
            }
            await page.keyboard.press('Enter')

            await expect(page).toHaveURL(paths.zones)
            await expect(drawer).toBeHidden()
            await expect(page).toHaveTitle(hr.app.documentTitle(hr.nav.zones))
        })
    }

    test('holds at 320 px with 200 % text zoom', async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 812 })
        await signIn(page)
        await zoomText(page)

        await expectNoHorizontalScroll(page)

        await page.getByRole('button', { name: hr.shell.openMenu }).click()
        const drawer = page.getByRole('dialog', { name: hr.shell.menu })
        await expect(drawer).toBeVisible()
        await waitForAnimations(drawer)
        await expectNoHorizontalScroll(page)
        await expect(drawer.getByRole('button', { name: hr.shell.signOut })).toBeInViewport()
    })
})

test.describe('tablet rail', () => {
    test.skip(({ isMobile }) => !isMobile, 'touch layouts run in the phone project')

    test('works by keyboard and touch at 768 px', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await signIn(page)
        const rail = page.getByRole('navigation', { name: hr.shell.mainNav })
        const toggle = page.getByRole('button', { name: hr.shell.expandMenu })
        const menu = page.getByRole('dialog', { name: hr.shell.menu })

        await expectNoHorizontalScroll(page)
        await expectTouchTargets(rail.getByRole('link'))
        await expectTouchTargets(toggle)
        await expectTouchTargets(page.getByRole('button', { name: hr.shell.signOut }))
        await expectNoAxeViolations(page)

        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await expect(page.getByRole('link', { name: hr.shell.homeLink })).toBeFocused()
        for (const label of Object.values(hr.nav)) {
            await page.keyboard.press('Tab')
            await expect(rail.getByRole('link', { name: label, exact: true })).toBeFocused()
        }
        await page.keyboard.press('Tab')
        await expect(toggle).toBeFocused()

        await page.keyboard.press('Enter')
        await expect(menu).toBeVisible()
        await waitForAnimations(menu)
        await expectTouchTargets(menu.getByRole('link'))
        await expectBelow(
            menu.getByRole('button', { name: hr.shell.collapseMenu }),
            menu.getByRole('link', { name: hr.nav.adminUsers, exact: true }),
        )
        await expectNoAxeViolations(page)
        await expectFocusTrapped(page, menu)

        await page.keyboard.press('Escape')
        await expect(menu).toBeHidden()
        await expect(toggle).toBeFocused()
    })

    test('holds at 768 px with 200 % text zoom', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await signIn(page)
        await zoomText(page)

        await expectNoHorizontalScroll(page)
        await expect(page.getByRole('button', { name: hr.shell.signOut })).toBeInViewport()
        await expect(page.getByRole('button', { name: hr.shell.expandMenu })).toBeInViewport()
    })
})

test.describe('desktop sidebar', () => {
    test.skip(({ isMobile }) => isMobile, 'the sidebar runs in the desktop project')

    test('navigates with the sidebar and marks the current page', async ({ page }) => {
        await signIn(page)
        const nav = page.getByRole('navigation', { name: hr.shell.mainNav })

        await nav.getByRole('link', { name: hr.nav.inspectors }).click()

        await expect(page).toHaveURL(paths.inspectors)
        await expect(nav.getByRole('link', { name: hr.nav.inspectors })).toHaveAttribute(
            'aria-current',
            'page',
        )
        await expect(page).toHaveTitle(hr.app.documentTitle(hr.nav.inspectors))
        await expectNoHorizontalScroll(page)
        await expectNoAxeViolations(page)
    })
})
