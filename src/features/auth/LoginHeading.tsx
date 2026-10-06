import { Heading, Image, Span } from '@chakra-ui/react'

import sparkMark from '@/shared/assets/spark-mark.svg'
import { hr } from '@/shared/i18n/hr'

/** The logo lockup is the page's h1, named "SPARK Admin" (accessibility.md, 01 Prijava). */
export function LoginHeading({ id }: { id: string }) {
    return (
        <Heading
            as="h1"
            id={id}
            display="flex"
            alignItems="center"
            gap="3"
            mb="3"
            // The lockup's 26/40 px is outside the type scale (docs/design/screens 01-prijava).
            fontSize="1.625rem"
            lineHeight="2.5rem"
            fontWeight="semibold"
            color="spark.heading"
        >
            <Image src={sparkMark} alt="" boxSize="10" flex="none" />
            <Span letterSpacing="0.06em">{hr.app.brand}</Span>{' '}
            <Span fontSize="md" fontWeight="normal" color="fg.muted">
                {hr.app.product}
            </Span>
        </Heading>
    )
}
