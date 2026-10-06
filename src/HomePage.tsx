import { Container, Heading } from '@chakra-ui/react'

import { hr } from '@/shared/i18n/hr'

// Placeholder until the app shell (#6) owns the signed-in pages.
export function HomePage() {
    return (
        <Container as="main" py="8">
            <Heading as="h1" color="spark.heading">
                {hr.app.name}
            </Heading>
        </Container>
    )
}
