import { Input } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { ApiError, endSession, fieldErrorsFrom } from '@/shared/api'
import { hr } from '@/shared/i18n/hr'
import { setServerFieldErrors } from '@/shared/lib/setServerFieldErrors'
import { expectNoAxeViolations } from '@/test/axe'
import { renderWithProviders } from '@/test/render'
import { signInForTest } from '@/test/session'

import { FormAlert } from './FormAlert'
import { FormDrawer } from './FormDrawer'
import { FormField } from './FormField'

const testFormSchema = z.object({
    code: z.string().trim().min(1),
    name: z.string().trim().min(1),
})

type TestFormValues = z.input<typeof testFormSchema>

const emptyTestForm: TestFormValues = { code: '', name: '' }
const rawToFormField = { zoneCode: 'code', zoneName: 'name' } as const

type Save = (values: TestFormValues) => Promise<void>

// Stands in for a feature's form, the way the Zone form will use the shared pieces.
function TestForm({ save }: { save: Save }) {
    const [isOpen, setIsOpen] = useState(false)
    const [saveError, setSaveError] = useState<Error | null>(null)
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isDirty, isSubmitting },
    } = useForm({
        resolver: zodResolver(testFormSchema),
        defaultValues: emptyTestForm,
        mode: 'onBlur',
    })

    async function submit(values: TestFormValues) {
        setSaveError(null)
        try {
            await save(values)
            setIsOpen(false)
        } catch (error) {
            const fieldErrors = fieldErrorsFrom(error, rawToFormField)
            if (!setServerFieldErrors(setError, fieldErrors)) setSaveError(error as Error)
        }
    }

    function message(type: string | undefined): string | undefined {
        if (type === undefined) return undefined
        if (type === 'duplicate') return hr.forms.serverFieldErrors.duplicate

        return 'Polje je obavezno.'
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    reset(emptyTestForm)
                    setSaveError(null)
                    setIsOpen(true)
                }}
            >
                Dodaj zonu
            </button>

            <FormDrawer
                isOpen={isOpen}
                title="Dodaj zonu"
                isDirty={isDirty}
                isSaving={isSubmitting}
                onClose={() => {
                    setIsOpen(false)
                }}
                onSubmit={(event) => void handleSubmit(submit)(event)}
            >
                {saveError && <FormAlert error={saveError} />}
                <FormField label="Šifra" error={message(errors.code?.type)}>
                    {(control) => <Input {...register('code')} {...control} />}
                </FormField>
                <FormField label="Naziv" error={message(errors.name?.type)}>
                    {(control) => <Input {...register('name')} {...control} />}
                </FormField>
            </FormDrawer>
        </>
    )
}

// A second, closed drawer on the page, as a list with add and edit forms will have.
function ClosedFormDrawer() {
    return (
        <FormDrawer
            isOpen={false}
            title="Uredi zonu"
            isDirty={false}
            isSaving={false}
            onClose={() => undefined}
            onSubmit={() => undefined}
        >
            {null}
        </FormDrawer>
    )
}

function renderTestForm(save: Save = () => Promise.resolve()) {
    const router = createMemoryRouter(
        [
            {
                path: '/zone',
                element: (
                    <>
                        <TestForm save={save} />
                        <ClosedFormDrawer />
                    </>
                ),
            },
            { path: '/karte', element: <h1>Karte</h1> },
            { path: '/prijava', element: <h1>Prijava</h1> },
        ],
        { initialEntries: ['/zone'] },
    )

    return { router, ...renderWithProviders(<RouterProvider router={router} />) }
}

async function openDirtyDrawer(rendered: ReturnType<typeof renderTestForm>) {
    await rendered.user.click(screen.getByRole('button', { name: 'Dodaj zonu' }))
    const drawer = await screen.findByRole('dialog', { name: 'Dodaj zonu' })
    await rendered.user.type(within(drawer).getByRole('textbox', { name: 'Šifra' }), 'ZONA1')

    return drawer
}

async function expectDrawerClosed() {
    await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: 'Dodaj zonu' })).not.toBeInTheDocument()
    })
}

/** Resolves once the dialog has taken focus, as it has by the time a person can act on it. */
async function discardDialog() {
    const dialog = await screen.findByRole('alertdialog', { name: hr.forms.discard.title })
    await waitFor(() => {
        expect(
            within(dialog).getByRole('button', { name: hr.forms.discard.keepEditing }),
        ).toHaveFocus()
    })

    return dialog
}

describe('FormDrawer', () => {
    beforeEach(() => {
        signInForTest()
        // Chakra's focus trap skips elements without layout, which in jsdom is all of them.
        vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(
            Object.assign([new DOMRect(0, 0, 100, 20)], { item: () => null }),
        )
    })

    it('moves focus to its title on open, and back to the opening button on close', async () => {
        const { user } = renderTestForm()
        const openButton = screen.getByRole('button', { name: 'Dodaj zonu' })

        await user.click(openButton)

        const drawer = await screen.findByRole('dialog', { name: 'Dodaj zonu' })
        await waitFor(() => {
            expect(within(drawer).getByRole('heading', { name: 'Dodaj zonu' })).toHaveFocus()
        })

        await user.click(within(drawer).getByRole('button', { name: hr.forms.close }))

        await expectDrawerClosed()
        expect(openButton).toHaveFocus()
    })

    it('starts the focus order with the close button, and ends it with Odustani then Spremi', async () => {
        const { user } = renderTestForm()
        await user.click(screen.getByRole('button', { name: 'Dodaj zonu' }))
        const drawer = await screen.findByRole('dialog', { name: 'Dodaj zonu' })

        const controls = [...drawer.querySelectorAll('button, input')]

        expect(controls[0]).toHaveAccessibleName(hr.forms.close)
        expect(controls.at(-2)).toHaveAccessibleName(hr.forms.cancel)
        expect(controls.at(-1)).toHaveAccessibleName(hr.forms.save)
    })

    it.each([
        ['the close button', hr.forms.close],
        ['Odustani', hr.forms.cancel],
    ])('closes at once from %s when nothing has changed', async (_, buttonName) => {
        const { user } = renderTestForm()
        await user.click(screen.getByRole('button', { name: 'Dodaj zonu' }))
        const drawer = await screen.findByRole('dialog', { name: 'Dodaj zonu' })

        await user.click(within(drawer).getByRole('button', { name: buttonName }))

        await expectDrawerClosed()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it.each([
        ['the close button', hr.forms.close],
        ['Odustani', hr.forms.cancel],
    ])('asks before discarding changes from %s', async (_, buttonName) => {
        const rendered = renderTestForm()
        const drawer = await openDirtyDrawer(rendered)

        await rendered.user.click(within(drawer).getByRole('button', { name: buttonName }))

        const dialog = await discardDialog()
        expect(dialog).toHaveAccessibleDescription(hr.forms.discard.description)
        expect(screen.getByRole('dialog', { name: 'Dodaj zonu', hidden: true })).toBeInTheDocument()
    })

    it('asks before discarding changes on Escape', async () => {
        const rendered = renderTestForm()
        await openDirtyDrawer(rendered)

        await rendered.user.keyboard('{Escape}')

        expect(await discardDialog()).toBeInTheDocument()
    })

    it('asks before discarding changes on a click outside the drawer', async () => {
        const rendered = renderTestForm()
        await openDirtyDrawer(rendered)

        // The backdrop takes no pointer events; the drawer listens for a press outside itself.
        fireEvent.pointerDown(document.body)

        expect(await discardDialog()).toBeInTheDocument()
    })

    it('starts the discard dialog on Nastavi uređivati, which keeps the form and its input', async () => {
        const rendered = renderTestForm()
        const drawer = await openDirtyDrawer(rendered)
        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.close }))
        const dialog = await discardDialog()

        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.keepEditing }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(within(drawer).getByRole('textbox', { name: 'Šifra' })).toHaveValue('ZONA1')
    })

    it('closes only the discard dialog on Escape', async () => {
        const rendered = renderTestForm()
        await openDirtyDrawer(rendered)
        await rendered.user.keyboard('{Escape}')
        await discardDialog()

        await rendered.user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(screen.getByRole('dialog', { name: 'Dodaj zonu', hidden: true })).toBeInTheDocument()
    })

    it('closes the drawer after Odbaci promjene', async () => {
        const rendered = renderTestForm()
        const drawer = await openDirtyDrawer(rendered)
        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.cancel }))
        const dialog = await discardDialog()

        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.confirm }),
        )

        await expectDrawerClosed()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('asks before a route change, and stays on the page after Nastavi uređivati', async () => {
        const rendered = renderTestForm()
        await openDirtyDrawer(rendered)

        void rendered.router.navigate('/karte')

        const dialog = await discardDialog()
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.keepEditing }),
        )

        await waitFor(() => {
            expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
        })
        expect(rendered.router.state.location.pathname).toBe('/zone')
        expect(screen.getByRole('dialog', { name: 'Dodaj zonu', hidden: true })).toBeInTheDocument()
    })

    it('goes ahead with the route change after Odbaci promjene', async () => {
        const rendered = renderTestForm()
        await openDirtyDrawer(rendered)

        void rendered.router.navigate('/karte')
        const dialog = await discardDialog()
        await rendered.user.click(
            within(dialog).getByRole('button', { name: hr.forms.discard.confirm }),
        )

        expect(await screen.findByRole('heading', { name: 'Karte' })).toBeInTheDocument()
    })

    it('lets the redirect to the login page through once the session has ended', async () => {
        const rendered = renderTestForm()
        await openDirtyDrawer(rendered)

        endSession('expired')
        void rendered.router.navigate('/prijava')

        expect(await screen.findByRole('heading', { name: 'Prijava' })).toBeInTheDocument()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('asks the browser to confirm a reload or a closed tab while there are changes', async () => {
        const rendered = renderTestForm()
        const cleanUnload = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(cleanUnload)
        expect(cleanUnload.defaultPrevented).toBe(false)

        await openDirtyDrawer(rendered)
        const dirtyUnload = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(dirtyUnload)

        expect(dirtyUnload.defaultPrevented).toBe(true)
    })

    it('does not ask after a successful save, on close or on a route change', async () => {
        const save = vi.fn<Save>(() => Promise.resolve())
        const rendered = renderTestForm(save)
        const drawer = await openDirtyDrawer(rendered)
        await rendered.user.type(
            within(drawer).getByRole('textbox', { name: 'Naziv' }),
            'Prva zona',
        )

        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.save }))

        await expectDrawerClosed()
        expect(save).toHaveBeenCalledWith({ code: 'ZONA1', name: 'Prva zona' })
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()

        void rendered.router.navigate('/karte')

        expect(await screen.findByRole('heading', { name: 'Karte' })).toBeInTheDocument()
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('moves focus to the first invalid field on submit', async () => {
        const save = vi.fn<Save>()
        const { user } = renderTestForm(save)
        await user.click(screen.getByRole('button', { name: 'Dodaj zonu' }))
        const drawer = await screen.findByRole('dialog', { name: 'Dodaj zonu' })

        await user.click(within(drawer).getByRole('button', { name: hr.forms.save }))

        const code = within(drawer).getByRole('textbox', { name: 'Šifra' })
        await waitFor(() => {
            expect(code).toHaveFocus()
        })
        expect(code).toHaveAccessibleDescription('Polje je obavezno.')
        expect(within(drawer).getByRole('textbox', { name: 'Naziv' })).toBeInvalid()
        expect(save).not.toHaveBeenCalled()
    })

    it('puts a server field error on its field and moves focus there', async () => {
        const save = vi.fn<Save>(() =>
            Promise.reject(
                new ApiError('conflict', {
                    status: 409,
                    body: { status: 409, code: 'duplicate', field: 'zoneName' },
                }),
            ),
        )
        const rendered = renderTestForm(save)
        const drawer = await openDirtyDrawer(rendered)
        await rendered.user.type(
            within(drawer).getByRole('textbox', { name: 'Naziv' }),
            'Prva zona',
        )
        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.save }))

        const name = within(drawer).getByRole('textbox', { name: 'Naziv' })
        await waitFor(() => {
            expect(name).toHaveFocus()
        })
        expect(name).toHaveAccessibleDescription(hr.forms.serverFieldErrors.duplicate)
        expect(within(drawer).queryByRole('alert')).not.toBeInTheDocument()
    })

    it('shows any other save error above the fields, with focus on it, and keeps the input', async () => {
        const save = vi.fn<Save>(() => Promise.reject(new ApiError('network')))
        const rendered = renderTestForm(save)
        const drawer = await openDirtyDrawer(rendered)
        await rendered.user.type(
            within(drawer).getByRole('textbox', { name: 'Naziv' }),
            'Prva zona',
        )

        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.save }))

        const alert = await within(drawer).findByRole('alert')
        expect(alert).toHaveTextContent(`${hr.forms.saveFailed} ${hr.forms.errors.network}`)
        await waitFor(() => {
            expect(alert).toHaveFocus()
        })
        expect(within(drawer).getByRole('textbox', { name: 'Šifra' })).toHaveValue('ZONA1')
    })

    it('has no axe violations, with field errors and the discard dialog open', async () => {
        const rendered = renderTestForm(() =>
            Promise.reject(new ApiError('server', { status: 500 })),
        )
        const drawer = await openDirtyDrawer(rendered)
        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.save }))
        await within(drawer).findByRole('textbox', { name: 'Naziv' })
        await waitFor(() => {
            expect(within(drawer).getByRole('textbox', { name: 'Naziv' })).toBeInvalid()
        })

        await expectNoAxeViolations(document.body)

        await rendered.user.click(within(drawer).getByRole('button', { name: hr.forms.cancel }))
        await discardDialog()

        await expectNoAxeViolations(document.body)
    })
})
