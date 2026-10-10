import { screen, waitFor, within } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'
import { expectNoAxeViolations } from '@/test/axe'
import { renderRoute, type RenderedRoute } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

const t = hr.citySettings
const { labels } = t

type Label = keyof typeof labels

async function renderPage() {
    signInForTest()
    const rendered = await renderRoute(paths.citySettings)
    await screen.findByRole('form', { name: hr.nav.citySettings })

    return rendered
}

function field(label: Label) {
    return screen.getByRole('textbox', { name: labels[label] })
}

function saveButton() {
    return screen.getByRole('button', { name: t.save })
}

function cancelButton() {
    return screen.getByRole('button', { name: hr.forms.cancel })
}

async function replaceValue({ user }: RenderedRoute, label: Label, value: string) {
    await user.clear(field(label))
    if (value !== '') await user.type(field(label), value)
}

/** Records the JSON body of each PUT /tenant; the mock still answers it. */
function capturePutBodies(): unknown[] {
    const bodies: unknown[] = []
    server.use(
        http.put(apiUrl('/tenant'), async ({ request }) => {
            bodies.push(await request.clone().json())
        }),
    )

    return bodies
}

describe('CitySettingsPage', () => {
    it("shows the city's saved settings in two titled sections", async () => {
        await renderPage()

        expect(screen.getByRole('heading', { level: 1, name: hr.nav.citySettings })).toBeVisible()
        expect(screen.getByRole('heading', { level: 2, name: t.sections.city })).toBeVisible()
        expect(
            screen.getByRole('heading', { level: 2, name: t.sections.fiscalization }),
        ).toBeVisible()
        expect(field('name')).toHaveValue('Grad Samobor')
        expect(field('oib')).toHaveValue('12345678903')
        expect(field('oib')).toHaveAccessibleDescription(t.oibHelp)
        expect(field('street')).toHaveValue('Trg kralja Tomislava')
        expect(field('houseNo')).toHaveValue('5')
        expect(field('zipCode')).toHaveValue('10430')
        expect(field('city')).toHaveValue('Samobor')
        expect(field('iban')).toHaveValue('HR1210010051863000160')
        expect(field('iban')).toHaveAccessibleDescription(t.ibanHelp)
        expect(field('premisesCode')).toHaveValue('SAMOBOR1')
        expect(field('cashRegisterCode')).toHaveValue('1')
        expect(field('vatRate')).toHaveValue('25')
        expect(document.title).toContain(hr.nav.citySettings)
    })

    it('keeps Spremi promjene and Odustani disabled until something changes', async () => {
        const rendered = await renderPage()

        expect(saveButton()).toBeDisabled()
        expect(cancelButton()).toBeDisabled()

        await replaceValue(rendered, 'houseNo', '5a')

        expect(saveButton()).toBeEnabled()
        expect(cancelButton()).toBeEnabled()
    })

    it('takes only digits in OIB, postcode and cash register, and a decimal in the VAT rate', async () => {
        const rendered = await renderPage()

        await replaceValue(rendered, 'oib', '12 345-678a903')
        await replaceValue(rendered, 'zipCode', 'HR-10430')
        await replaceValue(rendered, 'cashRegisterCode', 'k2')
        await replaceValue(rendered, 'vatRate', '13,5 %')

        expect(field('oib')).toHaveValue('12345678903')
        expect(field('zipCode')).toHaveValue('10430')
        expect(field('cashRegisterCode')).toHaveValue('2')
        expect(field('vatRate')).toHaveValue('13,5')
    })

    it('saves, normalises the IBAN, confirms with a toast and updates the header', async () => {
        const rendered = await renderPage()
        const bodies = capturePutBodies()
        const header = screen.getByRole('banner')
        expect(await within(header).findByText('Grad Samobor')).toBeInTheDocument()

        await replaceValue(rendered, 'name', 'Grad Samobor i okolica')
        await replaceValue(rendered, 'iban', 'hr12 1001 0051 8630 0016 0')
        await replaceValue(rendered, 'vatRate', '13,5')
        await rendered.user.click(saveButton())

        expect(await screen.findByText(t.saved)).toBeInTheDocument()
        expect(screen.getByText(t.savedDescription)).toBeInTheDocument()
        expect(bodies).toEqual([
            expect.objectContaining({
                tenantName: 'Grad Samobor i okolica',
                iban: 'HR1210010051863000160',
                stopaPDV: 13.5,
            }),
        ])
        expect(await within(header).findByText('Grad Samobor i okolica')).toBeInTheDocument()
        expect(field('iban')).toHaveValue('HR1210010051863000160')
        expect(saveButton()).toBeDisabled()
    })

    it('shows the message under a field when you leave it, and clears it as you fix it', async () => {
        const rendered = await renderPage()

        await replaceValue(rendered, 'oib', '1234567890')
        expect(field('oib')).toBeValid()
        await rendered.user.tab()

        expect(field('oib')).toBeInvalid()
        expect(field('oib')).toHaveAccessibleDescription(
            `${t.oibHelp} ${hr.forms.validation.oibInvalid}`,
        )

        await rendered.user.type(field('oib'), '3')

        expect(field('oib')).toBeValid()
    })

    it('sends nothing on a save with invalid fields, marks each one and focuses the first', async () => {
        const rendered = await renderPage()
        const bodies = capturePutBodies()

        await replaceValue(rendered, 'iban', 'HR12100100518630')
        await replaceValue(rendered, 'oib', '1234567890')
        await rendered.user.click(saveButton())

        await waitFor(() => {
            expect(field('oib')).toHaveFocus()
        })
        expect(field('oib')).toHaveAccessibleDescription(
            `${t.oibHelp} ${hr.forms.validation.oibInvalid}`,
        )
        expect(field('iban')).toHaveAccessibleDescription(
            `${t.ibanHelp} ${hr.forms.validation.ibanInvalid}`,
        )
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
        expect(bodies).toEqual([])
    })

    it('shows a rule message for the cash register code and the VAT rate', async () => {
        const rendered = await renderPage()

        await replaceValue(rendered, 'cashRegisterCode', '01')
        await replaceValue(rendered, 'vatRate', '120')
        await replaceValue(rendered, 'premisesCode', '')
        await rendered.user.click(saveButton())

        await waitFor(() => {
            expect(field('premisesCode')).toHaveFocus()
        })
        expect(field('premisesCode')).toHaveAccessibleDescription(hr.forms.validation.required)
        expect(field('cashRegisterCode')).toHaveAccessibleDescription(
            t.validation.cashRegisterInvalid,
        )
        expect(field('vatRate')).toHaveAccessibleDescription(t.validation.vatRateInvalid)
    })

    it('puts a field the server rejects under that field, with focus on it', async () => {
        server.use(
            http.put(apiUrl('/tenant'), () =>
                HttpResponse.json(
                    { status: 400, errors: { premisesCode: ['invalid'] } },
                    { status: 400 },
                ),
            ),
        )
        const rendered = await renderPage()

        await replaceValue(rendered, 'premisesCode', 'POSL 1')
        await rendered.user.click(saveButton())

        await waitFor(() => {
            expect(field('premisesCode')).toHaveFocus()
        })
        expect(field('premisesCode')).toHaveAccessibleDescription(
            hr.forms.serverFieldErrors.invalid,
        )
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('keeps the input after a failed save and retries from the toast', async () => {
        server.use(
            http.put(apiUrl('/tenant'), () => new HttpResponse(null, { status: 500 }), {
                once: true,
            }),
        )
        const rendered = await renderPage()

        await replaceValue(rendered, 'houseNo', '5a')
        await rendered.user.click(saveButton())

        const retry = await screen.findByRole('button', { name: hr.listStates.retry })
        const errorToast = screen.getByText(t.notSaved).closest('[data-part="root"]')
        expect(errorToast).toBeInTheDocument()
        expect(screen.getByText(hr.forms.errors.server)).toBeInTheDocument()
        expect(field('houseNo')).toHaveValue('5a')

        await rendered.user.click(retry)

        expect(await screen.findByText(t.saved)).toBeInTheDocument()
        // It leaves after its exit animation; closed is what the person sees at once.
        expect(errorToast).toHaveAttribute('data-state', 'closed')
    })

    it('asks before Odustani discards the changes, then restores the saved values', async () => {
        const rendered = await renderPage()
        await replaceValue(rendered, 'city', 'Zagreb')

        await rendered.user.click(cancelButton())
        const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.confirm }),
        )

        await waitFor(() => {
            expect(field('city')).toHaveValue('Samobor')
        })
        expect(saveButton()).toBeDisabled()
    })

    it('asks before leaving the page with unsaved changes', async () => {
        const rendered = await renderPage()
        await replaceValue(rendered, 'city', 'Zagreb')
        const nav = screen.getByRole('navigation', { name: hr.shell.mainNav })

        await rendered.user.click(within(nav).getByRole('link', { name: hr.nav.zones }))

        const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.keepEditing }),
        )
        expect(rendered.router.state.location.pathname).toBe(paths.citySettings)
        expect(field('city')).toHaveValue('Zagreb')
    })

    it('announces loading while the settings load', async () => {
        server.use(
            http.get(apiUrl('/tenant'), async () => {
                await delay('infinite')
            }),
        )
        signInForTest()
        await renderRoute(paths.citySettings)

        expect(await screen.findByRole('status')).toHaveTextContent(t.loading)
        expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    it('shows an error with a retry when the settings fail to load', async () => {
        // The shell asks for the city name too, so every load fails until the retry.
        let isFailing = true
        server.use(
            http.get(apiUrl('/tenant'), () => {
                if (isFailing) return new HttpResponse(null, { status: 500 })
            }),
        )
        signInForTest()
        const { user } = await renderRoute(paths.citySettings)

        const alert = await screen.findByRole('alert')
        expect(within(alert).getByRole('heading', { name: t.errorTitle })).toBeInTheDocument()
        isFailing = false

        await user.click(within(alert).getByRole('button', { name: hr.listStates.retry }))

        expect(await screen.findByRole('form', { name: hr.nav.citySettings })).toBeInTheDocument()
    })

    it('has no axe violations with field errors showing', async () => {
        const rendered = await renderPage()
        await replaceValue(rendered, 'oib', '123')
        await rendered.user.click(saveButton())
        await waitFor(() => {
            expect(field('oib')).toBeInvalid()
        })

        await expectNoAxeViolations(rendered.container)
    })
})
