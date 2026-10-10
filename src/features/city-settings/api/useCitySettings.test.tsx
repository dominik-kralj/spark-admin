import { act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { apiUrl } from '@/mocks/url'
import { renderHookWithQueryClient } from '@/test/render'
import { server } from '@/test/server'
import { signInForTest } from '@/test/session'

import { useCitySettings, useUpdateCitySettings } from './useCitySettings'
import { toCitySettingsFieldErrors, type CitySettings } from '../validators/citySettings'

const samobor: CitySettings = {
    name: 'Grad Samobor',
    oib: '12345678903',
    street: 'Trg kralja Tomislava',
    houseNo: '5',
    zipCode: '10430',
    city: 'Samobor',
    iban: 'HR1210010051863000160',
    premisesCode: 'SAMOBOR1',
    cashRegisterCode: '1',
    vatRate: 25,
}

function renderCitySettingsHooks() {
    signInForTest()

    return renderHookWithQueryClient(() => ({
        settings: useCitySettings(),
        update: useUpdateCitySettings(),
    }))
}

async function mutationError(run: () => Promise<unknown>): Promise<unknown> {
    let error: unknown
    await act(async () => {
        await run().catch((caught: unknown) => {
            error = caught
        })
    })

    return error
}

describe('useCitySettings', () => {
    it("loads the city's settings, mapped to the domain", async () => {
        const { result } = renderCitySettingsHooks()

        await waitFor(() => {
            expect(result.current.settings.data).toEqual(samobor)
        })
    })

    it('reports a failed load', async () => {
        server.use(http.get(apiUrl('/tenant'), () => new HttpResponse(null, { status: 500 })))
        const { result } = renderCitySettingsHooks()

        await waitFor(() => {
            expect(result.current.settings.error).toMatchObject({ kind: 'server' })
        })
    })
})

describe('useUpdateCitySettings', () => {
    it('saves the settings, which the next load returns', async () => {
        const { result } = renderCitySettingsHooks()
        const changed = { ...samobor, name: 'Grad Samobor (test)', vatRate: 13.5 }

        let saved: CitySettings | undefined
        await act(async () => {
            saved = await result.current.update.mutateAsync(changed)
        })

        expect(saved).toEqual(changed)
        await waitFor(() => {
            expect(result.current.settings.data).toEqual(changed)
        })
    })

    it('rejects a cash register code with a leading zero and a VAT rate over 100', async () => {
        const { result } = renderCitySettingsHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({
                ...samobor,
                cashRegisterCode: '01',
                vatRate: 101,
            }),
        )

        expect(error).toMatchObject({ kind: 'validation', status: 400 })
        expect(toCitySettingsFieldErrors(error)).toEqual({
            cashRegisterCode: 'invalid',
            vatRate: 'invalid',
        })
    })

    it('rejects an IBAN that is not HR and 19 digits, and a short OIB', async () => {
        const { result } = renderCitySettingsHooks()

        const error = await mutationError(() =>
            result.current.update.mutateAsync({ ...samobor, oib: '123', iban: 'HR12 1001' }),
        )

        expect(toCitySettingsFieldErrors(error)).toEqual({ oib: 'invalid', iban: 'invalid' })
    })
})
