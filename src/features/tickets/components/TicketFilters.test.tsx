import { screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import { filterBar, listRequests, openPage, ticketsTable } from './ticketFiltersPage'

const t = hr.tickets
const f = hr.ticketFilters

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
        const plate = filterBar().getByRole('searchbox', { name: f.plate })

        await user.type(plate, 'zg 12-34')
        expect(requests).toHaveLength(sent)

        await user.tab()
        expect(plate).toHaveValue('ZG1234')

        await user.click(filterBar().getByRole('button', { name: f.search }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?plate=ZG1234')
        })
        await waitFor(() => {
            expect(requests.at(-1)?.get('plate')).toBe('ZG1234')
        })
        expect(requests.at(-1)?.get('page')).toBe('1')
        expect(screen.queryByRole('button', { name: /ZG1234/ })).not.toBeInTheDocument()
    })

    it('clears the plate from inside its field, and drops an applied plate at once', async () => {
        const { user, router } = await openPage(`${paths.tickets}?plate=ZG1234AB&zone=1`)
        const plate = filterBar().getByRole('searchbox', { name: f.plate })

        await user.click(filterBar().getByRole('button', { name: f.clearPlate }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?zone=1')
        })
        expect(plate).toHaveValue('')
        expect(plate).toHaveFocus()
        expect(filterBar().queryByRole('button', { name: f.clearPlate })).not.toBeInTheDocument()
    })

    it('offers only days after Datum od in the Datum do calendar', async () => {
        const { user } = await openPage()

        await user.type(filterBar().getByRole('textbox', { name: f.from }), '15.10.2026')
        await user.type(filterBar().getByRole('textbox', { name: f.to }), '20.10.2026')
        await user.click(filterBar().getByRole('button', { name: hr.forms.datePicker.open(f.to) }))

        expect(
            await filterBar().findByRole('button', { name: /(^|\s)14\. listopada 2026/ }),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(
            filterBar().getByRole('button', { name: /(^|\s)16\. listopada 2026/ }),
        ).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('searches by plate on Enter', async () => {
        const { user, router } = await openPage()

        await user.type(filterBar().getByRole('searchbox', { name: f.plate }), 'zg1234ab{Enter}')

        await waitFor(() => {
            expect(router.state.location.search).toBe('?plate=ZG1234AB')
        })
        await waitFor(() => {
            expect(filterBar().getByRole('searchbox', { name: f.plate })).toHaveValue('ZG1234AB')
        })
    })

    it('filters by a range of whole days in Zagreb', async () => {
        const requests = listRequests()
        const { user, router } = await openPage()

        await user.type(filterBar().getByRole('textbox', { name: f.from }), '06.10.2026')
        await user.type(filterBar().getByRole('textbox', { name: f.to }), '06.10.2026')
        await user.click(filterBar().getByRole('button', { name: f.search }))

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

    it('moves an end typed before the start up to the start, so the range stays in order', async () => {
        const { user, router } = await openPage()

        await user.type(filterBar().getByRole('textbox', { name: f.from }), '07.10.2026')
        await user.type(filterBar().getByRole('textbox', { name: f.to }), '06.10.2026')
        await user.click(filterBar().getByRole('button', { name: f.search }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?from=2026-10-07&to=2026-10-07')
        })
        expect(filterBar().getByRole('textbox', { name: f.to })).toHaveValue('07.10.2026')
    })

    it('shows an unreadable date under its field when you leave it', async () => {
        const { user } = await openPage()
        const to = filterBar().getByRole('textbox', { name: f.to })

        await user.type(to, '31.02.2026')
        expect(to).toBeValid()
        await user.tab()

        expect(to).toHaveAttribute('aria-invalid', 'true')
        expect(to).toHaveAccessibleDescription(hr.forms.validation.dateInvalid)
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('searches nothing with an unreadable date, and focuses its field', async () => {
        const requests = listRequests()
        const { user, router } = await openPage()
        const sent = requests.length
        await user.type(filterBar().getByRole('textbox', { name: f.to }), '31.02.2026')

        await user.click(filterBar().getByRole('button', { name: f.search }))

        const to = filterBar().getByRole('textbox', { name: f.to })
        await waitFor(() => {
            expect(to).toHaveFocus()
        })
        expect(to).toHaveAccessibleDescription(hr.forms.validation.dateInvalid)
        expect(router.state.location.search).toBe('')
        expect(requests).toHaveLength(sent)
    })

    it('blocks a date it cannot read', async () => {
        const { user, router } = await openPage()

        await user.type(filterBar().getByRole('textbox', { name: f.from }), '2026-10-06')
        await user.click(filterBar().getByRole('button', { name: f.search }))

        expect(await filterBar().findByText(hr.forms.validation.dateFormat)).toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('filters by zone and by fiscalization status', async () => {
        const requests = listRequests()
        const { user, router } = await openPage()
        const zone = filterBar().getByRole('combobox', { name: f.zone })
        await waitFor(() => {
            expect(
                within(zone)
                    .getAllByRole('option')
                    .map((option) => option.textContent),
            ).toEqual([f.allZones, '2A', 'ZONA1'])
        })

        await user.selectOptions(zone, 'ZONA1')
        await user.selectOptions(
            filterBar().getByRole('combobox', { name: f.fiscal }),
            hr.processingStatus.fiscal.failed,
        )
        await user.click(filterBar().getByRole('button', { name: f.search }))

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

        expect(filterBar().getByRole('searchbox', { name: f.plate })).toHaveValue('ZG1234AB')
        expect(filterBar().getByRole('textbox', { name: f.from })).toHaveValue('06.10.2026')
        expect(filterBar().getByRole('textbox', { name: f.to })).toHaveValue('')
        await waitFor(() => {
            expect(filterBar().getByRole('combobox', { name: f.zone })).toHaveValue('1')
        })
        expect(filterBar().getByRole('combobox', { name: f.fiscal })).toHaveValue('done')
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
            expect(filterBar().getByRole('combobox', { name: f.zone })).toHaveValue('')
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

        await user.click(filterBar().getByRole('button', { name: f.clear }))

        await waitFor(() => {
            expect(router.state.location.search).toBe('?sort=plate&dir=asc')
        })
        await waitFor(() => {
            expect(filterBar().getByRole('searchbox', { name: f.plate })).toHaveValue('')
        })
        expect(filterBar().getByRole('textbox', { name: f.from })).toHaveValue('')
        await waitFor(() => {
            expect(screen.queryByRole('button', { name: f.remove(f.tags.zone('2A')) })).toBeNull()
        })
    })

    it('disables Pretraži until a field changes, and Očisti until there is something to clear', async () => {
        const { user } = await openPage()
        const search = filterBar().getByRole('button', { name: f.search })
        const clear = filterBar().getByRole('button', { name: f.clear })
        expect(search).toBeDisabled()
        expect(clear).toBeDisabled()

        await user.selectOptions(filterBar().getByRole('combobox', { name: f.zone }), 'ZONA1')

        expect(search).toBeEnabled()
        expect(clear).toBeEnabled()

        await user.click(search)

        await waitFor(() => {
            expect(search).toBeDisabled()
        })
        expect(clear).toBeEnabled()
    })

    it('enables Pretraži once a date is picked from the calendar', async () => {
        const { user } = await openPage()
        const search = filterBar().getByRole('button', { name: f.search })

        await user.click(
            filterBar().getByRole('button', { name: hr.forms.datePicker.open(f.from) }),
        )
        // The 15th is always in the month the calendar opens on.
        await user.click(await filterBar().findByRole('button', { name: /(^|\s)15\. / }))

        await waitFor(() => {
            expect(filterBar().getByRole('textbox', { name: f.from })).not.toHaveValue('')
        })
        expect(search).toBeEnabled()
    })

    it('disables the drawer buttons until there is something to apply or clear', async () => {
        const { user } = await openPage()

        await user.click(filterBar().getByRole('button', { name: f.open }))
        const drawer = await screen.findByRole('dialog', { name: f.drawerTitle })
        expect(within(drawer).getByRole('button', { name: f.apply })).toBeDisabled()
        expect(within(drawer).getByRole('button', { name: f.clearAll })).toBeDisabled()

        await user.type(within(drawer).getByRole('textbox', { name: f.from }), '01.10.2026')

        expect(within(drawer).getByRole('button', { name: f.apply })).toBeEnabled()
        expect(within(drawer).getByRole('button', { name: f.clearAll })).toBeEnabled()
    })

    it('clears values typed but not yet searched, and their errors', async () => {
        const { user, router } = await openPage()

        await user.type(filterBar().getByRole('searchbox', { name: f.plate }), 'zg12')
        await user.type(filterBar().getByRole('textbox', { name: f.from }), '2026-10-07')
        await user.click(filterBar().getByRole('button', { name: f.search }))
        expect(await filterBar().findByText(hr.forms.validation.dateFormat)).toBeInTheDocument()

        await user.click(filterBar().getByRole('button', { name: f.clear }))

        await waitFor(() => {
            expect(filterBar().getByRole('searchbox', { name: f.plate })).toHaveValue('')
        })
        expect(filterBar().getByRole('textbox', { name: f.from })).toHaveValue('')
        expect(filterBar().queryByText(hr.forms.validation.dateFormat)).not.toBeInTheDocument()
        expect(router.state.location.search).toBe('')
    })

    it('says when no ticket matches, and clears the filters from there', async () => {
        const { user, router } = await renderRoute(`${paths.tickets}?plate=NOSUCH`)

        expect(
            await screen.findByRole('heading', { level: 2, name: t.filters.noResults.title }),
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
