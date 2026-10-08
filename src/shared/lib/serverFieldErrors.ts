import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

import type { ServerFieldError } from '@/shared/api'

/** Sets each error on its field and focuses the first; false when there was none to set. */
export function setServerFieldErrors<TValues extends FieldValues>(
    setError: UseFormSetError<TValues>,
    fieldErrors: Partial<Record<Path<TValues>, ServerFieldError>>,
): boolean {
    // Object.entries widens the keys to string; they are the fields of fieldErrors.
    const entries = Object.entries(fieldErrors) as [Path<TValues>, ServerFieldError][]

    entries.forEach(([field, type], index) => {
        setError(field, { type }, { shouldFocus: index === 0 })
    })

    return entries.length > 0
}
