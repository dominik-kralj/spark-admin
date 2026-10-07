import { describe, expect, it, vi } from 'vitest'

import { endSession, getAccessToken, getSession, onSessionEnd, startSession } from './session'

const user = { id: 1, tenantId: 1, username: 'ana', firstName: 'Ana', lastName: 'Kovač' }

describe('session', () => {
    it('is empty before sign-in', () => {
        expect(getSession()).toBeNull()
        expect(getAccessToken()).toBeNull()
    })

    it('keeps the token and user in sessionStorage, so a reload stays signed in', () => {
        startSession('jwt-1', { user })

        expect(getSession()).toEqual({ user })
        expect(getAccessToken()).toBe('jwt-1')
        expect(sessionStorage.length).toBe(1)
    })

    it('treats a corrupt stored session as signed out', () => {
        startSession('jwt-1', { user })
        const key = sessionStorage.key(0) ?? ''

        sessionStorage.setItem(key, '{"token":')
        expect(getSession()).toBeNull()

        sessionStorage.setItem(key, JSON.stringify({ token: 'jwt-1' }))
        expect(getAccessToken()).toBeNull()
    })

    it('clears the storage and tells listeners once why it ended', () => {
        const listener = vi.fn()
        const unsubscribe = onSessionEnd(listener)
        startSession('jwt-1', { user })

        endSession('expired')
        endSession('expired')

        expect(getSession()).toBeNull()
        expect(sessionStorage.length).toBe(0)
        expect(listener).toHaveBeenCalledOnce()
        expect(listener).toHaveBeenCalledWith('expired')

        unsubscribe()
        startSession('jwt-2', { user })
        endSession('signedOut')
        expect(listener).toHaveBeenCalledOnce()
    })
})
