import type { Dictionary } from './dictionary'
import { en } from './en'
import { hr } from './hr'

export const languages = ['hr', 'en'] as const

export type Language = (typeof languages)[number]

export const dictionaries: Record<Language, Dictionary> = { hr, en }

export const languageNames: Record<Language, string> = { hr: 'Hrvatski', en: 'English' }

export const languagePickerLabel = 'Jezik / Language'

const storageKey = 'spark-admin.language'
const listeners = new Set<() => void>()
// Used when storage is blocked (private mode, a policy), so switching still works for the tab.
let unstoredLanguage: Language = 'hr'

export function isLanguage(value: unknown): value is Language {
    return languages.some((language) => language === value)
}

export function getLanguage(): Language {
    try {
        const stored = localStorage.getItem(storageKey)

        return isLanguage(stored) ? stored : 'hr'
    } catch {
        return unstoredLanguage
    }
}

export function setLanguage(language: Language): void {
    try {
        localStorage.setItem(storageKey, language)
    } catch {
        unstoredLanguage = language
    }
    for (const listener of listeners) listener()
}

export function subscribeToLanguage(listener: () => void): () => void {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}
