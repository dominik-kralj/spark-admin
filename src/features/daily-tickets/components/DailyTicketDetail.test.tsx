import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockDailyTicketIds } from '@/mocks/dailyTickets'
import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { giveElementsLayout } from '@/test/layout'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.dailyTickets.detail
const photos = t.photos

const detailPath = (id: string) => `${paths.dailyTickets}/${id}`

async function findDrawer(plate: string) {
    return screen.findByRole('dialog', { name: t.title(plate) })
}

/** Each label and its value, in order, from the drawer's description lists. */
function fieldValues(drawer: HTMLElement): [string, string][] {
    return within(drawer)
        .getAllByRole('term')
        .map((term) => [term.textContent, term.nextElementSibling?.textContent ?? ''])
}

describe('DPK detail', () => {
    beforeEach(() => {
        signInForTest()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('opens from a table row with the headings and every field formatted', async () => {
        giveElementsLayout()
        const { user, router } = await renderRoute(paths.dailyTickets)
        const table = await screen.findByRole('table', { name: hr.dailyTickets.listLabel })

        await user.click(within(table).getByRole('link', { name: 'ZG9087KL' }))

        const drawer = await findDrawer('ZG9087KL')
        expect(router.state.location.pathname).toBe(detailPath(mockDailyTicketIds.failed))
        await waitFor(() => {
            expect(within(drawer).getByRole('heading', { level: 2 })).toHaveFocus()
        })
        expect(
            within(drawer)
                .getAllByRole('heading', { level: 3 })
                .map((heading) => heading.textContent),
        ).toEqual([t.ticketSection, t.photosSection(3), t.fiscalSection])
        expect(fieldValues(drawer)).toEqual([
            ['Registracija', 'ZG9087KL'],
            ['Zona', '2A'],
            ['Vrijeme izdavanja', '06.10.2026 08:48'],
            ['Iznos', '15,00 EUR'],
            ['Adresa', 'Perkovčeva ulica 12'],
            ['Kontrolor', 'Marko Horvat'],
            ['Status', 'Neuspjelo'],
            ['JIR', t.jirMissing],
            ['ZKI', expect.stringMatching(/^[\da-f]{32}$/) as string],
        ])
    })

    it('leads with the failure, its system response and the retry on a failed ticket', async () => {
        await renderRoute(detailPath(mockDailyTicketIds.failed))

        const drawer = await findDrawer('ZG9087KL')
        // The first thing in the body: the notice, then the retry inside it.
        const [notice] = within(drawer).getAllByText((_, element) =>
            Boolean(element?.textContent.startsWith(t.failure.title)),
        )
        if (notice === undefined) throw new Error('Expected the failure notice')
        expect(notice).toHaveTextContent(/Odgovor sustava: s005: Porezna uprava/)
        expect(notice).toHaveTextContent(t.failure.advice)
        expect(
            within(drawer).getByRole('button', {
                name: hr.dailyTickets.fiscalize.actionFor('ZG9087KL'),
            }),
        ).toBeInTheDocument()
    })

    it('has no failure notice and no retry on a fiscalized ticket', async () => {
        await renderRoute(detailPath(mockDailyTicketIds.newest))

        const drawer = await findDrawer('ZG5553AI')
        expect(within(drawer).queryByText(t.failure.title)).not.toBeInTheDocument()
        expect(within(drawer).queryByRole('alert')).not.toBeInTheDocument()
        expect(
            within(drawer).queryByRole('button', { name: /Fiskaliziraj ponovno/ }),
        ).not.toBeInTheDocument()
        expect(fieldValues(drawer).at(-2)).toEqual([
            'JIR',
            expect.stringMatching(/^[\da-f-]{36}$/) as string,
        ])
    })

    it('shows each photo with alt text, lazy and sized before it loads', async () => {
        await renderRoute(detailPath(mockDailyTicketIds.failed))

        const drawer = await findDrawer('ZG9087KL')
        const buttons = [1, 2, 3].map((index) =>
            within(drawer).getByRole('button', { name: photos.enlarge(index, 3) }),
        )
        const images = buttons.map((button) => button.querySelector('img'))
        expect(images.map((image) => image?.getAttribute('alt'))).toEqual([
            photos.alt('ZG9087KL', 1, 3),
            photos.alt('ZG9087KL', 2, 3),
            photos.alt('ZG9087KL', 3, 3),
        ])
        expect(buttons[0]).toHaveAccessibleDescription(photos.alt('ZG9087KL', 1, 3))
        for (const image of images) {
            expect(image).toHaveAttribute('loading', 'lazy')
            expect(image).toHaveAttribute('width', '800')
            expect(image).toHaveAttribute('height', '600')
        }
        expect(within(drawer).getByText(photos.hint)).toBeInTheDocument()
    })

    it('enlarges a photo from the keyboard, and Escape returns to it', async () => {
        const { user } = await renderRoute(detailPath(mockDailyTicketIds.failed))
        const drawer = await findDrawer('ZG9087KL')
        const second = within(drawer).getByRole('button', { name: photos.enlarge(2, 3) })

        second.focus()
        await user.keyboard('{Enter}')

        const viewer = await screen.findByRole('dialog', { name: photos.viewerTitle(2, 3) })
        expect(within(viewer).getByAltText(photos.alt('ZG9087KL', 2, 3))).toBeInTheDocument()
        expect(within(viewer).getByRole('button', { name: photos.closeViewer })).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(
                screen.queryByRole('dialog', { name: photos.viewerTitle(2, 3) }),
            ).not.toBeInTheDocument()
        })
        expect(await findDrawer('ZG9087KL')).toBeInTheDocument()
        await waitFor(() => {
            expect(second).toHaveFocus()
        })
    })

    it('says when a photo cannot be loaded, and no longer offers to enlarge it', async () => {
        await renderRoute(detailPath(mockDailyTicketIds.brokenPhoto))
        const drawer = await findDrawer('ST8032PV')
        const broken = within(drawer)
            .getByRole('button', { name: photos.enlarge(2, 3) })
            .querySelector('img')
        if (broken === null) throw new Error('Expected the second photo')

        fireEvent.error(broken)

        expect(await within(drawer).findByText(photos.unavailable)).toBeInTheDocument()
        expect(
            within(drawer).queryByRole('button', { name: photos.enlarge(2, 3) }),
        ).not.toBeInTheDocument()
        expect(
            within(drawer).getByRole('button', { name: photos.enlarge(1, 3) }),
        ).toBeInTheDocument()
    })

    it('says when the ticket has no photos', async () => {
        await renderRoute(detailPath(mockDailyTicketIds.noPhotos))

        const drawer = await findDrawer('KA4410CD')
        expect(
            within(drawer).getByRole('heading', { level: 3, name: t.photosSection(0) }),
        ).toBeInTheDocument()
        expect(within(drawer).getByText(photos.none)).toBeInTheDocument()
    })

    it('closes with the back arrow, back to the list', async () => {
        const { user, router } = await renderRoute(paths.dailyTickets)
        const list = await screen.findByRole('list', { name: hr.dailyTickets.listLabel })
        const cardLink = within(list).getByRole('link', { name: /ZG5553AI/ })

        await user.click(cardLink)
        const drawer = await findDrawer('ZG5553AI')
        await user.click(within(drawer).getByRole('button', { name: t.back }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(router.state.location.pathname).toBe(paths.dailyTickets)
        await waitFor(() => {
            expect(cardLink).toHaveFocus()
        })
    })

    it("says when the ticket does not exist, as for another city's ticket", async () => {
        const { container } = await renderRoute(detailPath(mockDailyTicketIds.otherCity))

        const drawer = await screen.findByRole('dialog', { name: t.fallbackTitle })
        expect(
            await within(drawer).findByRole('heading', { level: 2, name: t.notFound.title }),
        ).toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('shows the error state and loads again on retry', async () => {
        server.use(
            http.get(
                apiUrl('/daily-tickets/:ticketId'),
                () => new HttpResponse(null, { status: 500 }),
                { once: true },
            ),
        )
        const { user } = await renderRoute(detailPath(mockDailyTicketIds.newest))

        const drawer = await screen.findByRole('dialog', { name: t.fallbackTitle })
        const alert = await within(drawer).findByRole('alert')
        expect(within(alert).getByRole('heading', { name: t.errorTitle })).toBeInTheDocument()

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await findDrawer('ZG5553AI')).toBeInTheDocument()
    })

    it('has no axe violations with a failed ticket open', async () => {
        const { container } = await renderRoute(detailPath(mockDailyTicketIds.failed))
        await findDrawer('ZG9087KL')

        await expectNoAxeViolations(container)
    })
})
