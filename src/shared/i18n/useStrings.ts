import { useSyncExternalStore } from 'react'

import type { Dictionary } from './dictionary'
import { getLanguage, getStrings, subscribeToLanguage, type Language } from './language'

export function useLanguage(): Language {
    return useSyncExternalStore(subscribeToLanguage, getLanguage)
}

/** The active language's strings; components re-render when the language changes. */
export function useStrings(): Dictionary {
    useLanguage()

    return getStrings()
}
