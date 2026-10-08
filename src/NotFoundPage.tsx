import { Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { SearchX } from 'lucide-react'
import { Link } from 'react-router'

import { useStrings } from '@/shared/i18n/useStrings'
import { paths } from '@/shared/paths'

export function NotFoundPage() {
    const t = useStrings()

    return (
        <Flex as="main" minH="100dvh" align="center" justify="center" p="6" bg="bg">
            <title>{t.app.documentTitle(t.notFound.title)}</title>

            <Stack align="center" gap="2" maxW="420px" textAlign="center">
                <SearchX size="28" aria-hidden="true" />
                <Heading as="h1" mt="2" fontSize="lg" color="spark.heading">
                    {t.notFound.title}
                </Heading>
                <Text color="fg.muted">{t.notFound.description}</Text>
                <Button asChild colorPalette="blue" mt="3">
                    <Link to={paths.home}>{t.notFound.home}</Link>
                </Button>
            </Stack>
        </Flex>
    )
}
