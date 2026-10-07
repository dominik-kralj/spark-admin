import { Button, Container, Heading, Stack, Text } from '@chakra-ui/react'
import { SearchX } from 'lucide-react'
import { Link } from 'react-router'

import { hr } from '@/shared/i18n/hr'
import { paths } from '@/shared/paths'

export function NotFoundPage() {
    return (
        <Container as="main" py="8">
            <Stack
                align="center"
                gap="2"
                px="6"
                py="16"
                bg="bg.panel"
                borderWidth="1px"
                borderRadius="lg"
                textAlign="center"
            >
                <SearchX size="28" aria-hidden="true" />
                <Heading as="h1" mt="2" fontSize="lg" color="spark.heading">
                    {hr.notFound.title}
                </Heading>
                <Text maxW="420px" color="fg.muted">
                    {hr.notFound.description}
                </Text>
                <Button asChild colorPalette="blue" mt="3">
                    <Link to={paths.home}>{hr.notFound.home}</Link>
                </Button>
            </Stack>
        </Container>
    )
}
