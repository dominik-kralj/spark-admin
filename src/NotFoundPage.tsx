import { Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { SearchX } from 'lucide-react'
import { Link } from 'react-router'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

export function NotFoundPage() {
    return (
        <Flex as="main" minH="100dvh" align="center" justify="center" p="6" bg="bg">
            <title>{hr.app.documentTitle(hr.notFound.title)}</title>

            <Stack align="center" gap="2" maxW="420px" textAlign="center">
                <SearchX size="28" aria-hidden="true" />
                <Heading as="h1" mt="2" fontSize="lg" color="spark.heading">
                    {hr.notFound.title}
                </Heading>
                <Text color="fg.muted">{hr.notFound.description}</Text>
                <Button asChild colorPalette="blue" mt="3">
                    <Link to={paths.home}>{hr.notFound.home}</Link>
                </Button>
            </Stack>
        </Flex>
    )
}
