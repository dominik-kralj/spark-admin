import { useSyncExternalStore } from 'react'

import type { Dictionary } from './dictionary'
import { dictionaries, getLanguage, subscribeToLanguage, type Language } from './language'

export function useLanguage(): Language {
    return useSyncExternalStore(subscribeToLanguage, getLanguage)
}

export function useStrings(): Dictionary {
    return dictionaries[useLanguage()]
}
