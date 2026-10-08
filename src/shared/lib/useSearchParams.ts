import { useSearchParams as useRouterSearchParams } from 'react-router'

/** A param set to null is removed, so a list in its default state keeps the URL clean. */
export type SearchParamUpdates = Record<string, string | null>

/** The URL's search params, updated in place: a list's view state is not a history step. */
export function useSearchParams() {
    const [searchParams, setSearchParams] = useRouterSearchParams()

    function updateSearchParams(updates: SearchParamUpdates): void {
        setSearchParams(
            (current) => {
                const next = new URLSearchParams(current)
                for (const [name, value] of Object.entries(updates)) {
                    if (value === null) next.delete(name)
                    else next.set(name, value)
                }

                return next
            },
            { replace: true },
        )
    }

    return { searchParams, updateSearchParams }
}

export function useSearchParam(name: string, defaultValue: string) {
    const { searchParams, updateSearchParams } = useSearchParams()

    function setValue(value: string): void {
        updateSearchParams({ [name]: value === defaultValue ? null : value })
    }

    return [searchParams.get(name) ?? defaultValue, setValue] as const
}
