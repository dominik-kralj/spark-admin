import { Flex, Heading } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { hr } from '@/shared/i18n/hr'

interface PageHeaderProps {
    title: string
    action?: ReactNode
}

export function PageHeader({ title, action }: PageHeaderProps) {
    return (
        <Flex wrap="wrap" align="center" justify="space-between" columnGap="4" rowGap="3">
            <title>{hr.app.documentTitle(title)}</title>

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
