import { VisuallyHidden } from '@chakra-ui/react'
import { useSyncExternalStore } from 'react'

import { getAnnouncement, subscribeToAnnouncements } from '@/shared/lib/announcer'

/**
 * The page's one polite live region. It is in the DOM before any message, so screen
 * readers announce text put into it; a region mounted with its text is often skipped.
 */
export function LiveRegion() {
    const message = useSyncExternalStore(subscribeToAnnouncements, getAnnouncement)

    return <VisuallyHidden role="status">{message}</VisuallyHidden>
}
