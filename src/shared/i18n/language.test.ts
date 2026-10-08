import { afterEach, describe, expect, it, vi } from 'vitest'

import { en } from './en'
import { hr } from './hr'
import { dictionaries, getLanguage, setLanguage } from './language'

afterEach(() => {
    vi.restoreAllMocks()
})

describe('language', () => {
    it('defaults to Croatian', () => {
        expect(getLanguage()).toBe('hr')
        expect(dictionaries[getLanguage()]).toBe(hr)
    })

    it('switches the strings and remembers the choice in this browser', () => {
        setLanguage('en')

        expect(getLanguage()).toBe('en')
        expect(dictionaries[getLanguage()]).toBe(en)
        expect(localStorage.getItem('spark-admin.language')).toBe('en')
    })

    it('falls back to Croatian for a stored value it does not know', () => {
        localStorage.setItem('spark-admin.language', 'de')

        expect(getLanguage()).toBe('hr')
    })

    it('falls back to Croatian, and still switches, when storage throws', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('blocked')
        })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('blocked')
        })

        expect(getLanguage()).toBe('hr')

        setLanguage('en')

        expect(getLanguage()).toBe('en')
    })
})
