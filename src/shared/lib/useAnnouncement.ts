import { useEffect } from 'react'

import { announce } from './announcer'

/** Announces `label` while the component is mounted, and clears it after. */
export function useAnnouncement(label: string): void {
    useEffect(() => {
        announce(label)

        return () => {
            announce('')
        }
    }, [label])
}
