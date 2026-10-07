import { Center, Heading, Stack } from '@chakra-ui/react'

import { hr } from '@/shared/i18n/hr'

export function PlaceholderPage({ title }: { title: string }) {
    return (
        <Stack gap="4" flex="1">
            <title>{hr.app.documentTitle(title)}</title>

            <Heading
                as="h1"
                fontSize={{ base: '1.375rem', md: '2xl' }}
                lineHeight={{ base: '1.75rem', md: '2rem' }}
                color="spark.heading"
            >
                {title}
            </Heading>

            <Center
                flex="1"
                minH="320px"
                borderWidth="1px"
                borderStyle="dashed"
                borderColor="border.emphasized"
                borderRadius="l3"
                color="fg.muted"
            >
                {hr.shell.placeholder}
            </Center>
        </Stack>
    )
}
