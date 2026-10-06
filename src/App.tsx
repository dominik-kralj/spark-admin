import { Container, Heading } from '@chakra-ui/react'

import { hr } from '@/shared/i18n/hr'

export function App() {
    return (
        <Container as="main" py="8">
            <Heading as="h1" color="spark.heading">
                {hr.app.name}
            </Heading>
        </Container>
    )
}
