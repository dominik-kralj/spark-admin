import { Image, Span } from '@chakra-ui/react'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { hr } from '@/shared/i18n/hr'

/** The mark and wordmark; the parent lays them out in a row. */
export function Logo() {
    return (
        <>
            <Image src={sparkMark} alt="" boxSize="7" flex="none" />
            <Span fontSize="lg" fontWeight="semibold" letterSpacing="0.06em">
                {hr.app.brand}
            </Span>
            <Span fontSize="caption" color="fg.muted">
                {hr.app.product}
            </Span>
        </>
    )
}
