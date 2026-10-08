import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

interface PageHeaderProps {
    title: string
    /** One line under the title; the phone design leaves it out. */
    description?: string
    action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    const t = useStrings()

    return (
        <Flex wrap="wrap" align="center" justify="space-between" columnGap="4" rowGap="3">
            <title>{t.app.documentTitle(title)}</title>

            <Box>
                <Heading
                    as="h1"
                    fontSize={{ base: '1.375rem', md: '2xl' }}
                    lineHeight={{ base: '1.75rem', md: '2rem' }}
                    color="spark.heading"
                >
                    {title}
                </Heading>
                {description !== undefined && (
                    <Text hideBelow="md" mt="1" color="fg.muted">
                        {description}
                    </Text>
                )}
            </Box>

            {action}
        </Flex>
    )
}
