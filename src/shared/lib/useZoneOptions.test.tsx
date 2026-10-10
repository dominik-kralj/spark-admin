import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHookWithQueryClient } from '@/test/render'
import { signInForTest } from '@/test/session'

import { useZoneOptions } from './useZoneOptions'

describe('useZoneOptions', () => {
    it("lists the city's zones by code", async () => {
        signInForTest()
        const { result } = renderHookWithQueryClient(() => useZoneOptions())

        await waitFor(() => {
            expect(result.current.data).toEqual([
                { id: 2, code: '2A' },
                { id: 1, code: 'ZONA1' },
            ])
        })
    })
})
