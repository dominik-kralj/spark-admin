import { Flex, Heading } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

interface PageHeaderProps {
    title: string
    action?: ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
    const t = useStrings()

    return (
        <Flex wrap="wrap" align="center" justify="space-between" columnGap="4" rowGap="3">
            <title>{t.app.documentTitle(title)}</title>

            <Heading
                as="h1"
                fontSize={{ base: '1.375rem', md: '2xl' }}
                lineHeight={{ base: '1.75rem', md: '2rem' }}
                color="spark.heading"
            >
                {title}
            </Heading>

            {action}
        </Flex>
    )
}
