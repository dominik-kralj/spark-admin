import { useSearchParams } from 'react-router'

import type { Validity } from './validity'

export type ValidityFilter = 'all' | Validity

export const validityFilters: readonly ValidityFilter[] = ['all', 'valid', 'expired']

const validityParam = 'validity'
const plateParam = 'plate'

export function readValidity(value: string | null): ValidityFilter {
    return validityFilters.find((filter) => filter === value) ?? 'all'
}

/** The list's validity tab and plate search, kept in the URL; the defaults leave it clean. */
export function usePrivilegedOwnerFilters() {
    const [searchParams, setSearchParams] = useSearchParams()

    function setParam(name: string, value: string, defaultValue: string): void {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current)
                if (value === defaultValue) next.delete(name)
                else next.set(name, value)

                return next
            },
            { replace: true },
        )
    }

    return {
        validity: readValidity(searchParams.get(validityParam)),
        plateSearch: searchParams.get(plateParam) ?? '',
        setValidity: (validity: ValidityFilter) => {
            setParam(validityParam, validity, 'all')
        },
        setPlateSearch: (plateSearch: string) => {
            setParam(plateParam, plateSearch, '')
        },
    }
}
