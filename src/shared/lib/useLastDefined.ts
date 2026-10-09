import { useState } from 'react'

/** The value, or the last one it had while it is undefined: an overlay keeps its content as it closes. */
export function useLastDefined<T>(value: T | undefined): T | undefined {
    const [last, setLast] = useState(value)
    if (value !== undefined && value !== last) setLast(value)

    return value ?? last
}
