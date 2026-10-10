import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.reports
const now = new Date('2026-10-10T10:00:00Z')
const previewPath = '/reports/:reportKey/preview'

async function renderPage() {
    const rendered = await renderRoute(paths.reports)
    await screen.findByRole('form', { name: t.form.label })

    return rendered
}

function field(label: string) {
    return screen.getByRole('textbox', { name: label })
}

function select(label: string) {
    return screen.getByRole('combobox', { name: label })
}

function showPreviewButton() {
    return screen.getByRole('button', { name: t.form.submit })
}

async function previewTable() {
    return screen.findByRole('table', { name: t.preview.tableLabel })
}

/** Records each preview request's report and query; the mock still answers it. */
function capturePreviewRequests() {
    const requests: { reportKey: string; query: Record<string, string> }[] = []
    server.use(
        http.get(apiUrl(previewPath), ({ params, request }) => {
            requests.push({
                reportKey: String(params.reportKey),
                query: Object.fromEntries(new URL(request.url).searchParams),
            })
        }),
    )

    return requests
}

async function replaceValue({ user }: RenderedRoute, label: string, value: string) {
    await user.clear(field(label))
    if (value !== '') await user.type(field(label), value)
}

describe('ReportsPage', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'], now })
        signInForTest()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('offers the reports, last month and every zone, with no preview yet', async () => {
        const { container } = await renderPage()

        expect(screen.getByRole('heading', { level: 1, name: hr.nav.reports })).toBeVisible()
        expect(document.title).toContain(hr.nav.reports)
        const reports = within(select(t.form.report)).getAllByRole('option')
        expect(reports.map((option) => option.textContent)).toEqual([
            'Prihod po zonama',
            'Naplata po danima',
            'Dnevne parkirne karte',
        ])
        expect(select(t.form.report)).toHaveDisplayValue('Prihod po zonama')
        expect(field(t.form.from)).toHaveValue('01.09.2026')
        expect(field(t.form.to)).toHaveValue('30.09.2026')
        expect(
            await within(select(t.form.zone)).findByRole('option', { name: 'ZONA1' }),
        ).toBeVisible()
        expect(select(t.form.zone)).toHaveDisplayValue(t.form.allZones)

        expect(screen.getByRole('heading', { level: 2, name: t.noPreview.title })).toBeVisible()
        expect(screen.queryByRole('button', { name: t.pdf.button })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: t.email.button })).not.toBeInTheDocument()
        await expectNoAxeViolations(container)
    })

    it('asks for the chosen parameters and names them over the preview', async () => {
        const requests = capturePreviewRequests()
        const rendered = await renderPage()
        const { user } = rendered

        await user.selectOptions(select(t.form.report), 'Naplata po danima')
        await user.selectOptions(
            select(t.form.zone),
            await within(select(t.form.zone)).findByRole('option', { name: '2A' }),
        )
        await replaceValue(rendered, t.form.to, '15.09.2026')
        await user.click(showPreviewButton())

        await previewTable()
        expect(requests).toEqual([
            {
                reportKey: 'revenue-by-day',
                query: {
                    dateFrom: '2026-08-31T22:00:00.000Z',
                    dateTo: '2026-09-15T22:00:00.000Z',
                    zoneId: '2',
                },
            },
        ])
        const preview = screen.getByRole('region', { name: t.preview.title })
        expect(
            within(preview).getByRole('heading', { level: 3, name: 'Naplata po danima' }),
        ).toBeVisible()
        expect(
            await within(preview).findByText('Grad Samobor · 01.09.2026 – 15.09.2026 · 2A'),
        ).toBeVisible()
    })

    it('formats each column by its kind, in the table and the phone cards', async () => {
        server.use(
            http.get(apiUrl(previewPath), () =>
                HttpResponse.json({
                    columns: [
                        { key: 'day', label: 'Datum', type: 'date' },
                        { key: 'zone', label: 'Zona', type: 'text' },
                        { key: 'tickets', label: 'Karte', type: 'count' },
                        { key: 'revenue', label: 'Prihod', type: 'amount' },
                    ],
                    rows: [
                        { day: '2026-09-01', zone: 'ZONA1', tickets: 1204, revenue: 842.8 },
                        { day: '2026-09-02', zone: '2A', tickets: 96, revenue: 48 },
                    ],
                    totals: { tickets: 1300, revenue: 890.8 },
                }),
            ),
        )
        const { user } = await renderPage()

        await user.click(showPreviewButton())

        const table = await previewTable()
        expect(
            within(table)
                .getAllByRole('columnheader')
                .map((header) => header.textContent),
        ).toEqual(['Datum', 'Zona', 'Karte', 'Prihod'])
        const cellsOf = (row: HTMLElement) =>
            within(row)
                .getAllByRole('cell')
                .map((cell) => cell.textContent)
        const [, firstRow] = within(table).getAllByRole('row')
        if (firstRow === undefined) throw new Error('Expected a data row')
        expect(cellsOf(firstRow)).toEqual(['01.09.2026', 'ZONA1', '1.204', '842,80 EUR'])
        const totals = within(table).getByRole('rowheader', { name: t.preview.total }).closest('tr')
        if (totals === null) throw new Error('Expected a total row')
        expect(cellsOf(totals)).toEqual(['', '1.300', '890,80 EUR'])

        const cards = within(screen.getByRole('list', { name: t.preview.tableLabel })).getAllByRole(
            'listitem',
        )
        expect(cards.map((card) => card.textContent)).toEqual([
            '01.09.2026ZonaZONA1Karte1.204Prihod842,80 EUR',
            '02.09.2026Zona2AKarte96Prihod48,00 EUR',
            `${t.preview.total}Karte1.300Prihod890,80 EUR`,
        ])
    })

    it('announces the preview while it is prepared', async () => {
        server.use(
            http.get(apiUrl(previewPath), async () => {
                await delay('infinite')
            }),
        )
        const { user } = await renderPage()

        await user.click(showPreviewButton())

        expect(await screen.findByText(t.previewLoading, { selector: 'p' })).toBeVisible()
        await waitFor(() => {
            expect(screen.getByRole('status')).toHaveTextContent(t.previewLoading)
        })
    })

    it('keeps Prikaži pregled disabled after a preview until a parameter changes', async () => {
        const { user } = await renderPage()
        expect(showPreviewButton()).toBeEnabled()

        await user.click(showPreviewButton())
        await previewTable()

        expect(showPreviewButton()).toBeDisabled()
        await user.selectOptions(select(t.form.report), 'Naplata po danima')
        expect(showPreviewButton()).toBeEnabled()
        await user.selectOptions(select(t.form.report), 'Prihod po zonama')
        expect(showPreviewButton()).toBeDisabled()
    })

    it('says a date is missing when the field is left empty', async () => {
        const { user } = await renderPage()

        await user.clear(field(t.form.from))
        await user.tab()

        expect(field(t.form.from)).toHaveAccessibleDescription(hr.forms.validation.required)
    })

    it('says a typed date does not exist', async () => {
        const rendered = await renderPage()

        await replaceValue(rendered, t.form.from, '31.09.2026')
        await rendered.user.tab()

        expect(field(t.form.from)).toHaveAccessibleDescription(hr.forms.validation.dateInvalid)
    })

    it('moves a typed end before the start up to the start, as on Karte', async () => {
        const rendered = await renderPage()

        await replaceValue(rendered, t.form.to, '31.08.2026')
        await rendered.user.tab()

        // That no message stays under the moved date is checked in e2e: jsdom can run the blur's
        // check after the move under load.
        await waitFor(() => {
            expect(field(t.form.to)).toHaveValue('01.09.2026')
        })
    })

    it('sends nothing for invalid parameters and focuses the first invalid field', async () => {
        const requests = capturePreviewRequests()
        const rendered = await renderPage()

        await replaceValue(rendered, t.form.from, '1.9.')
        await replaceValue(rendered, t.form.to, '')
        await rendered.user.click(showPreviewButton())

        expect(field(t.form.from)).toHaveFocus()
        expect(field(t.form.from)).toHaveAccessibleDescription(hr.forms.validation.dateFormat)
        expect(field(t.form.to)).toHaveAccessibleDescription(hr.forms.validation.required)
        expect(requests).toEqual([])
        expect(screen.getByRole('heading', { level: 2, name: t.noPreview.title })).toBeVisible()
    })

    it('shows a failed preview and tries again', async () => {
        server.use(
            http.get(apiUrl(previewPath), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const { user, container } = await renderPage()

        await user.click(showPreviewButton())

        const alert = await screen.findByRole('alert')
        expect(
            within(alert).getByRole('heading', { level: 2, name: t.previewErrorTitle }),
        ).toBeVisible()
        expect(alert).toHaveTextContent(hr.listStates.errors.server)
        await expectNoAxeViolations(container)

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await previewTable()).toBeVisible()
    })

    it('says so when the report has no rows for the period', async () => {
        server.use(
            http.get(apiUrl(previewPath), () =>
                HttpResponse.json({
                    columns: [{ key: 'zone', label: 'Zona', type: 'text' }],
                    rows: [],
                    totals: null,
                }),
            ),
        )
        const { user } = await renderPage()

        await user.click(showPreviewButton())

        expect(await screen.findByText(t.preview.noRows)).toBeVisible()
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('passes axe with a preview', async () => {
        const { user, container } = await renderPage()

        await user.click(showPreviewButton())
        await previewTable()

        await expectNoAxeViolations(container)
    })

    describe('the list of reports', () => {
        it('announces that it is loading', async () => {
            server.use(
                http.get(apiUrl('/reports'), async () => {
                    await delay('infinite')
                }),
            )

            await renderRoute(paths.reports)

            await waitFor(() => {
                expect(screen.getByRole('status')).toHaveTextContent(t.loading)
            })
            expect(screen.queryByRole('form')).not.toBeInTheDocument()
        })

        it('shows a failed load and tries again', async () => {
            server.use(
                http.get(apiUrl('/reports'), () => new HttpResponse(null, { status: 503 }), {
                    once: true,
                }),
            )
            const { user } = await renderRoute(paths.reports)

            const alert = await screen.findByRole('alert')
            expect(within(alert).getByRole('heading', { name: t.errorTitle })).toBeVisible()
            await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

            expect(await screen.findByRole('form', { name: t.form.label })).toBeVisible()
        })

        it('says so when the city has no reports', async () => {
            server.use(http.get(apiUrl('/reports'), () => HttpResponse.json([])))
            const { container } = await renderRoute(paths.reports)

            expect(
                await screen.findByRole('heading', { level: 2, name: t.empty.title }),
            ).toBeVisible()
            expect(screen.queryByRole('form')).not.toBeInTheDocument()
            await expectNoAxeViolations(container)
        })
    })
})
