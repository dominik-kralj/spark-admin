import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import { bar, listRequests, openPage } from './ticketFiltersPage'

const f = hr.ticketFilters

describe('Karte filter drawer (phone and tablet)', () => {
    beforeEach(() => {
        signInForTest()

        return () => {
            server.events.removeAllListeners()
        }
    })

    it('names the active filter count on its button', async () => {
        await openPage(`${paths.tickets}?plate=ZG&from=2026-10-01&to=2026-10-06&zone=1`)

        expect(bar().getByRole('button', { name: f.openWithCount(2) })).toBeInTheDocument()
    })

    it('applies the filters in the drawer, then returns focus to its button', async () => {
        const requests = listRequests()
        const { user, router } = await openPage(`${paths.tickets}?page=2&plate=ZG`)
        const trigger = bar().getByRole('button', { name: f.open })

        await user.click(trigger)

        const drawer = await screen.findByRole('dialog', { name: f.drawerTitle })
        await waitFor(() => {
            expect(drawer).toContainElement(document.activeElement as HTMLElement)
        })
        const sent = requests.length

        await user.type(within(drawer).getByRole('textbox', { name: f.from }), '01.10.2026')
        await user.selectOptions(
            within(drawer).getByRole('combobox', { name: f.fiscal }),
            hr.processingStatus.fiscal.pending,
        )
        expect(requests).toHaveLength(sent)

        await user.click(within(drawer).getByRole('button', { name: f.apply }))

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(router.state.location.search).toBe('?plate=ZG&from=2026-10-01&fiscal=pending')
        // Focus returns after the drawer's exit animation, which a full parallel run slows past 3 s.
        await waitFor(
            () => {
                expect(bar().getByRole('button', { name: f.openWithCount(2) })).toHaveFocus()
            },
            { timeout: 5000 },
        )
        await waitFor(() => {
            expect(requests.at(-1)?.get('fiscalStatus')).toBe('PENDING')
        })
        expect(requests.at(-1)?.get('page')).toBe('1')
    })

    it('keeps the drawer open on a date it cannot read, with the error under the field', async () => {
        const { user, router } = await openPage()

        await user.click(bar().getByRole('button', { name: f.open }))
        const drawer = await screen.findByRole('dialog', { name: f.drawerTitle })
        await user.type(within(drawer).getByRole('textbox', { name: f.from }), '31.02.2026')
        await user.click(within(drawer).getByRole('button', { name: f.apply }))

        expect(await within(drawer).findByText(hr.forms.validation.dateInvalid)).toBeVisible()
        expect(drawer).toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('clears every drawer filter but keeps the plate', async () => {
        const { user, router } = await openPage(`${paths.tickets}?plate=ZG&zone=1&fiscal=done`)

        await user.click(bar().getByRole('button', { name: f.openWithCount(2) }))
        const drawer = await screen.findByRole('dialog', { name: f.drawerTitle })
        await user.click(within(drawer).getByRole('button', { name: f.clearAll }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?plate=ZG')
        })
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('closes on Escape without applying anything', async () => {
        const { user, router } = await openPage()
        const trigger = bar().getByRole('button', { name: f.open })

        await user.click(trigger)
        const drawer = await screen.findByRole('dialog', { name: f.drawerTitle })
        await user.selectOptions(
            within(drawer).getByRole('combobox', { name: f.fiscal }),
            hr.processingStatus.fiscal.done,
        )
        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
        expect(router.state.location.search).toBe('')
        await waitFor(() => {
            expect(trigger).toHaveFocus()
        })
    })

    it('has no axe violations with the drawer open', async () => {
        const { user, container } = await openPage(`${paths.tickets}?zone=1`)

        await user.click(bar().getByRole('button', { name: f.openWithCount(1) }))
        await screen.findByRole('dialog', { name: f.drawerTitle })

        await expectNoAxeViolations(container.ownerDocument.body)
    })
})
