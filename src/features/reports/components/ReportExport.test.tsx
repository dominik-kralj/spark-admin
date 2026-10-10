import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { stubObjectUrls } from '@/test/objectUrls'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.reports
const now = new Date('2026-10-10T10:00:00Z')
const pdfPath = '/reports/:reportKey/pdf'
const emailPath = '/reports/:reportKey/email'
const fileName = 'izvjestaj-revenue-by-zone-2026-09-01-2026-09-30.pdf'
const confirmDescription = t.email.confirmDescription(
    'Prihod po zonama',
    '01.09.2026 – 30.09.2026',
    'promet@samobor.hr',
)

/** Stands in for the browser's download: records each saved file and revoked URL. */
function captureDownloads() {
    const downloads: { fileName: string; file: Blob | undefined }[] = []
    const { files, revoked } = stubObjectUrls()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
    ) {
        downloads.push({ fileName: this.download, file: files.get(this.href) })
    })

    return { downloads, revoked }
}

async function renderWithPreview() {
    const rendered = await renderRoute(paths.reports)
    await rendered.user.click(await screen.findByRole('button', { name: t.form.submit }))
    await screen.findByRole('table', { name: t.preview.tableLabel })

    return rendered
}

function pdfButton() {
    return screen.getByRole('button', { name: t.pdf.button })
}

function emailButton() {
    return screen.getByRole('button', { name: t.email.button })
}

/** Opens the dialog once the preset address has loaded and enabled the button. */
async function openSendDialog({ user }: RenderedRoute) {
    await waitFor(() => {
        expect(emailButton()).toBeEnabled()
    })
    await user.click(emailButton())

    return screen.findByRole('alertdialog', { name: t.email.confirmTitle })
}

describe('Report export', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'], now })
        signInForTest()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    describe('PDF', () => {
        it('downloads the previewed report as a PDF named by its days', async () => {
            const { downloads, revoked } = captureDownloads()
            const { user } = await renderWithPreview()

            await user.click(pdfButton())

            expect(await screen.findByText(t.pdf.downloaded)).toBeInTheDocument()
            expect(screen.getByText(t.pdf.downloadedDescription(fileName))).toBeInTheDocument()
            expect(downloads.map((download) => download.fileName)).toEqual([fileName])
            expect(downloads[0]?.file?.type).toBe('application/pdf')
            await waitFor(() => {
                expect(revoked).toEqual(['blob:file-1'])
            })
        })

        it('asks for the parameters of the preview, not what the form holds since', async () => {
            captureDownloads()
            const queries: Record<string, string>[] = []
            server.use(
                http.get(apiUrl(pdfPath), ({ request }) => {
                    queries.push(Object.fromEntries(new URL(request.url).searchParams))
                }),
            )
            const { user } = await renderWithPreview()

            await user.selectOptions(
                screen.getByRole('combobox', { name: t.form.zone }),
                screen.getByRole('option', { name: 'ZONA1' }),
            )
            await user.click(pdfButton())

            await screen.findByText(t.pdf.downloaded)
            expect(queries).toEqual([
                { dateFrom: '2026-08-31T22:00:00.000Z', dateTo: '2026-09-30T22:00:00.000Z' },
            ])
        })

        it('reports a failed download and tries again from the toast', async () => {
            const { downloads } = captureDownloads()
            server.use(
                http.get(apiUrl(pdfPath), () => new HttpResponse(null, { status: 500 }), {
                    once: true,
                }),
            )
            const { user } = await renderWithPreview()

            await user.click(pdfButton())

            expect(await screen.findByText(t.pdf.failed)).toBeInTheDocument()
            expect(screen.getByText(t.errors.server)).toBeInTheDocument()
            expect(downloads).toEqual([])

            await user.click(screen.getByRole('button', { name: hr.listStates.retry }))

            expect(await screen.findByText(t.pdf.downloaded)).toBeInTheDocument()
            expect(downloads.map((download) => download.fileName)).toEqual([fileName])
        })

        it('shows the download in progress on the button', async () => {
            captureDownloads()
            server.use(
                http.get(apiUrl(pdfPath), async () => {
                    await delay('infinite')
                }),
            )
            const { user } = await renderWithPreview()

            await user.click(pdfButton())

            await waitFor(() => {
                expect(pdfButton()).toBeDisabled()
            })
        })
    })

    describe('e-mail', () => {
        it('names the preset address under the button', async () => {
            await renderWithPreview()

            await waitFor(() => {
                expect(emailButton()).toHaveAccessibleDescription(
                    t.email.recipient('promet@samobor.hr'),
                )
            })
        })

        it('asks first, then sends the previewed report and confirms with a toast', async () => {
            const bodies: unknown[] = []
            server.use(
                http.post(apiUrl(emailPath), async ({ request }) => {
                    bodies.push(await request.clone().json())
                }),
            )
            const rendered = await renderWithPreview()
            const { user, container } = rendered

            const dialog = await openSendDialog(rendered)
            expect(dialog).toHaveAccessibleDescription(confirmDescription)
            await expectNoAxeViolations(container.ownerDocument.body)
            expect(bodies).toEqual([])

            await user.click(within(dialog).getByRole('button', { name: t.email.confirm }))

            expect(await screen.findByText(t.email.sent)).toBeInTheDocument()
            expect(screen.getByText(t.email.sentDescription('promet@samobor.hr'))).toBeVisible()
            await waitFor(() => {
                expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
            })
            expect(bodies).toEqual([
                { dateFrom: '2026-08-31T22:00:00.000Z', dateTo: '2026-09-30T22:00:00.000Z' },
            ])
        })

        it('sends nothing when cancelled', async () => {
            let requests = 0
            server.use(
                http.post(apiUrl(emailPath), () => {
                    requests += 1
                }),
            )
            const rendered = await renderWithPreview()

            const dialog = await openSendDialog(rendered)
            await rendered.user.click(within(dialog).getByRole('button', { name: hr.forms.cancel }))

            await waitFor(() => {
                expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
            })
            expect(emailButton()).toHaveFocus()
            expect(requests).toBe(0)
        })

        it('keeps the dialog open with the reason when sending fails', async () => {
            server.use(
                http.post(
                    apiUrl(emailPath),
                    () => HttpResponse.json({ code: 'noReportEmail' }, { status: 409 }),
                    { once: true },
                ),
            )
            const rendered = await renderWithPreview()
            const { user } = rendered

            const dialog = await openSendDialog(rendered)
            await user.click(within(dialog).getByRole('button', { name: t.email.confirm }))

            const alert = await within(dialog).findByRole('alert')
            expect(alert).toHaveTextContent(t.email.failed)
            expect(alert).toHaveTextContent(t.errors.conflict)

            await user.click(within(dialog).getByRole('button', { name: t.email.confirm }))

            expect(await screen.findByText(t.email.sent)).toBeInTheDocument()
        })

        it('cannot be sent while the city has no preset address', async () => {
            server.use(
                http.get(apiUrl('/tenant'), () =>
                    HttpResponse.json({ tenantName: 'Grad Samobor', reportEmail: null }),
                ),
            )
            await renderWithPreview()

            await waitFor(() => {
                expect(emailButton()).toHaveAccessibleDescription(t.email.noRecipient)
            })
            expect(emailButton()).toBeDisabled()
            expect(pdfButton()).toBeEnabled()
        })
    })
})
