import { HStack, Image, Span } from '@chakra-ui/react'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { useStrings } from '@/shared/i18n/useStrings'

export function Logo() {
    const t = useStrings()

    return (
        <HStack gap="2.5" color="spark.heading">
            <Image src={sparkMark} alt="" boxSize="7" flex="none" />
            <Span fontSize="lg" fontWeight="semibold" letterSpacing="0.06em">
                {t.app.brand}
            </Span>
            <Span fontSize="caption" color="fg.muted">
                {t.app.product}
            </Span>
        </HStack>
    )
}
