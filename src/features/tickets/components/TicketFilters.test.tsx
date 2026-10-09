import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.tickets
const f = t.filters

/** Records the query string of every list request (not the newest-ticket lookup). */
function listRequests(): URLSearchParams[] {
    const requests: URLSearchParams[] = []
    server.events.on('request:start', ({ request }) => {
        const url = new URL(request.url)
        if (url.pathname.endsWith('/tickets') && url.searchParams.get('pageSize') !== '1') {
            requests.push(url.searchParams)
        }
    })

    return requests
}

// A first render of 25 rows and 25 cards can pass the default 3 s while every file runs at once.
async function ticketsTable() {
    return screen.findByRole('table', { name: t.listLabel }, { timeout: 5000 })
}

function filterBar() {
    return screen.getByRole('search', { name: f.label })
}

function bar() {
    return within(filterBar())
}

async function openPage(path: string = paths.tickets) {
    const rendered = await renderRoute(path)
    await ticketsTable()

    return rendered
}

describe('Karte filters', () => {
    beforeEach(() => {
        signInForTest()

        return () => {
            server.events.removeAllListeners()
        }
    })

    it('normalises the plate, sends nothing while typing, and searches from page 1', async () => {
        const requests = listRequests()
        const { user, router } = await openPage(`${paths.tickets}?page=3`)
        const sent = requests.length
        const plate = bar().getByRole('searchbox', { name: f.plate })

        await user.type(plate, 'zg 12-34')
        expect(requests).toHaveLength(sent)

        await user.tab()
        expect(plate).toHaveValue('ZG1234')

        await user.click(bar().getByRole('button', { name: f.search }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?plate=ZG1234')
        })
        await waitFor(() => {
            expect(requests.at(-1)?.get('plate')).toBe('ZG1234')
        })
        expect(requests.at(-1)?.get('page')).toBe('1')
        expect(screen.queryByRole('button', { name: /ZG1234/ })).not.toBeInTheDocument()
    })

    it('searches by plate on Enter', async () => {
        const { user, router } = await openPage()

        await user.type(bar().getByRole('searchbox', { name: f.plate }), 'zg1234ab{Enter}')

        await waitFor(() => {
            expect(router.state.location.search).toBe('?plate=ZG1234AB')
        })
        await waitFor(() => {
            expect(bar().getByRole('searchbox', { name: f.plate })).toHaveValue('ZG1234AB')
        })
    })

    it('filters by a range of whole days in Zagreb', async () => {
        const requests = listRequests()
        const { user, router } = await openPage()

        await user.type(bar().getByRole('textbox', { name: f.from }), '06.10.2026')
        await user.type(bar().getByRole('textbox', { name: f.to }), '06.10.2026')
        await user.click(bar().getByRole('button', { name: f.search }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?from=2026-10-06&to=2026-10-06')
        })
        await waitFor(() => {
            expect(requests.at(-1)?.get('createdFrom')).toBe('2026-10-05T22:00:00.000Z')
        })
        expect(requests.at(-1)?.get('createdTo')).toBe('2026-10-06T22:00:00.000Z')
        expect(
            screen.getByRole('button', {
                name: f.remove(f.tags.range('06.10.2026', '06.10.2026')),
            }),
        ).toBeInTheDocument()
    })

    it('blocks a range that ends before it starts', async () => {
        const requests = listRequests()
        const { user, router } = await openPage()
        const sent = requests.length

        await user.type(bar().getByRole('textbox', { name: f.from }), '07.10.2026')
        await user.type(bar().getByRole('textbox', { name: f.to }), '06.10.2026')
        await user.click(bar().getByRole('button', { name: f.search }))

        const to = bar().getByRole('textbox', { name: f.to })
        await waitFor(() => {
            expect(to).toHaveAccessibleDescription(hr.forms.validation.dateRangeOrder)
        })
        expect(to).toHaveAttribute('aria-invalid', 'true')
        expect(router.state.location.search).toBe('')
        expect(requests).toHaveLength(sent)
    })

    it('blocks a date it cannot read', async () => {
        const { user, router } = await openPage()

        await user.type(bar().getByRole('textbox', { name: f.from }), '2026-10-06')
        await user.click(bar().getByRole('button', { name: f.search }))

        expect(await bar().findByText(hr.forms.validation.dateFormat)).toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('filters by zone and by fiscalization status', async () => {
        const requests = listRequests()
        const { user, router } = await openPage()
        const zone = bar().getByRole('combobox', { name: f.zone })
        await waitFor(() => {
            expect(
                within(zone)
                    .getAllByRole('option')
                    .map((option) => option.textContent),
            ).toEqual([f.allZones, '2A', 'ZONA1'])
        })

        await user.selectOptions(zone, 'ZONA1')
        await user.selectOptions(
            bar().getByRole('combobox', { name: f.fiscal }),
            hr.processingStatus.fiscal.failed,
        )
        await user.click(bar().getByRole('button', { name: f.search }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?zone=1&fiscal=failed')
        })
        await waitFor(() => {
            expect(requests.at(-1)?.get('zoneId')).toBe('1')
        })
        expect(requests.at(-1)?.get('fiscalStatus')).toBe('FAIL')
        expect(screen.getByRole('button', { name: f.remove(f.tags.zone('ZONA1')) })).toBeVisible()
        expect(
            screen.getByRole('button', {
                name: f.remove(f.tags.fiscal(hr.processingStatus.fiscal.failed)),
            }),
        ).toBeInTheDocument()
    })

    it('opens with the filters in the URL, as after a reload', async () => {
        const requests = listRequests()
        await openPage(`${paths.tickets}?plate=ZG1234AB&from=2026-10-06&zone=1&fiscal=done`)

        expect(bar().getByRole('searchbox', { name: f.plate })).toHaveValue('ZG1234AB')
        expect(bar().getByRole('textbox', { name: f.from })).toHaveValue('06.10.2026')
        expect(bar().getByRole('textbox', { name: f.to })).toHaveValue('')
        await waitFor(() => {
            expect(bar().getByRole('combobox', { name: f.zone })).toHaveValue('1')
        })
        expect(bar().getByRole('combobox', { name: f.fiscal })).toHaveValue('done')
        expect(requests[0]?.get('plate')).toBe('ZG1234AB')
        expect(requests[0]?.get('createdFrom')).toBe('2026-10-05T22:00:00.000Z')
        expect(
            screen.getByRole('button', { name: f.remove(f.tags.rangeFrom('06.10.2026')) }),
        ).toBeInTheDocument()
    })

    it('removes one filter with its tag, from page 1', async () => {
        const requests = listRequests()
        const { user, router } = await renderRoute(`${paths.tickets}?page=2&zone=1&fiscal=failed`)

        await user.click(
            await screen.findByRole('button', { name: f.remove(f.tags.zone('ZONA1')) }),
        )

        await waitFor(() => {
            expect(router.state.location.search).toBe('?fiscal=failed')
        })
        await waitFor(() => {
            expect(bar().getByRole('combobox', { name: f.zone })).toHaveValue('')
        })
        await waitFor(() => {
            expect(requests.at(-1)?.has('zoneId')).toBe(false)
        })
        expect(requests.at(-1)?.get('fiscalStatus')).toBe('FAIL')
    })

    it('clears every filter but keeps the sort', async () => {
        const { user, router } = await openPage(
            `${paths.tickets}?sort=plate&dir=asc&plate=ZG&from=2026-10-01&to=2026-10-06&zone=2`,
        )

        await user.click(bar().getByRole('button', { name: f.clear }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?sort=plate&dir=asc')
        })
        await waitFor(() => {
            expect(bar().getByRole('searchbox', { name: f.plate })).toHaveValue('')
        })
        expect(bar().getByRole('textbox', { name: f.from })).toHaveValue('')
        expect(screen.queryByRole('button', { name: f.remove(f.tags.zone('2A')) })).toBeNull()
    })

    it('says when no ticket matches, and clears the filters from there', async () => {
        const { user, router } = await renderRoute(`${paths.tickets}?plate=NOSUCH`)

        expect(
            await screen.findByRole('heading', { level: 2, name: f.noResults.title }),
        ).toBeInTheDocument()
        expect(screen.queryByText(t.empty.title)).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: f.clearAll }))

        expect(await ticketsTable()).toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('has no axe violations with filters set', async () => {
        const { container } = await openPage(`${paths.tickets}?plate=ZG&zone=1&fiscal=done`)
        await screen.findByRole('button', { name: f.remove(f.tags.zone('ZONA1')) })

        await expectNoAxeViolations(container)
    })
})

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
        await waitFor(() => {
            expect(bar().getByRole('button', { name: f.openWithCount(2) })).toHaveFocus()
        })
        await waitFor(() => {
            expect(requests.at(-1)?.get('fiscalStatus')).toBe('PENDING')
        })
        expect(requests.at(-1)?.get('page')).toBe('1')
    })

    it('keeps the drawer open on an invalid range', async () => {
        const { user, router } = await openPage()

        await user.click(bar().getByRole('button', { name: f.open }))
        const drawer = await screen.findByRole('dialog', { name: f.drawerTitle })
        await user.type(within(drawer).getByRole('textbox', { name: f.from }), '07.10.2026')
        await user.type(within(drawer).getByRole('textbox', { name: f.to }), '06.10.2026')
        await user.click(within(drawer).getByRole('button', { name: f.apply }))

        expect(
            await within(drawer).findByText(hr.forms.validation.dateRangeOrder),
        ).toBeInTheDocument()
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
