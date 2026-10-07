import { describe, expect, it, vi } from 'vitest'

import { testUser as user } from '@/test/session'

import { endSession, getAccessToken, getSessionUser, onSessionEnd, startSession } from './session'

describe('session', () => {
    it('is empty before sign-in', () => {
        expect(getSessionUser()).toBeNull()
        expect(getAccessToken()).toBeNull()
    })

    it('keeps the token and user in sessionStorage, so a reload stays signed in', () => {
        startSession('jwt-1', user)

        expect(getSessionUser()).toEqual(user)
        expect(getAccessToken()).toBe('jwt-1')
        expect(sessionStorage.length).toBe(1)
    })

    it('treats a corrupt stored session as signed out', () => {
        startSession('jwt-1', user)
        const key = sessionStorage.key(0) ?? ''

        sessionStorage.setItem(key, '{"token":')
        expect(getSessionUser()).toBeNull()

        sessionStorage.setItem(key, JSON.stringify({ user }))
        expect(getAccessToken()).toBeNull()
    })

    it('clears the storage and tells listeners once why it ended', () => {
        const listener = vi.fn()
        const unsubscribe = onSessionEnd(listener)
        startSession('jwt-1', user)

        endSession('expired')
        endSession('expired')

        expect(getSessionUser()).toBeNull()
        expect(sessionStorage.length).toBe(0)
        expect(listener).toHaveBeenCalledOnce()
        expect(listener).toHaveBeenCalledWith('expired')

        unsubscribe()
        startSession('jwt-2', user)
        endSession('signedOut')
        expect(listener).toHaveBeenCalledOnce()
    })
})
