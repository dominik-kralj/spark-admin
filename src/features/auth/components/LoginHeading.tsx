import { Heading, Image, Span } from '@chakra-ui/react'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { useStrings } from '@/shared/i18n/useStrings'

export function LoginHeading({ id }: { id: string }) {
    const t = useStrings()

    return (
        <Heading
            as="h1"
            id={id}
            display="flex"
            alignItems="center"
            gap="3"
            mb="3"
            fontSize="1.625rem"
            lineHeight="2.5rem"
            fontWeight="semibold"
            color="spark.heading"
        >
            <Image src={sparkMark} alt="" boxSize="10" flex="none" />
            <Span letterSpacing="0.06em">{t.app.brand}</Span>{' '}
            <Span fontSize="md" fontWeight="normal" color="fg.muted">
                {t.app.product}
            </Span>
        </Heading>
    )
}
