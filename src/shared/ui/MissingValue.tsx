import { VisuallyHidden } from '@chakra-ui/react'

import { useStrings } from '@/shared/i18n/useStrings'

/** A dash on screen, words for a screen reader, which may skip the dash. */
export function MissingValue() {
    const t = useStrings()

    return (
        <>
            <span aria-hidden="true">–</span>
            <VisuallyHidden>{t.details.missing}</VisuallyHidden>
        </>
    )
}
