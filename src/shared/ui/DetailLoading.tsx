import { Skeleton, Stack } from '@chakra-ui/react'

import { useAnnouncement } from '@/shared/lib/useAnnouncement'

/** A detail's body while it loads; the label goes to the shell's live region. */
export function DetailLoading({ label }: { label: string }) {
    useAnnouncement(label)

    return (
        <Stack gap="4" aria-hidden="true">
            <Skeleton h="16" borderRadius="md" />
            <Skeleton h="4" w="40%" />
            <Skeleton h="24" />
            <Skeleton h="24" />
        </Stack>
    )
}
