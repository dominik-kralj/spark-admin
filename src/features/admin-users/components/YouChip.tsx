import { Badge } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'

/** Marks the signed-in user's own row. */
export function YouChip() {
    const t = useStrings()

    return (
        <Badge colorPalette="gray" size="md">
            {t.adminUsers.you}
        </Badge>
    )
}
