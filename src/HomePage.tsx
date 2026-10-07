import { Button, Container, Heading } from '@chakra-ui/react'

import { signOut } from '@/api'
import { hr } from '@/shared/i18n/hr'

export function HomePage() {
    return (
        <Container as="main" py="8">
            <Heading as="h1" color="spark.heading">
                {hr.app.name}
            </Heading>

            {/* Moves into the header with the app shell (#6). */}
            <Button variant="outline" mt="6" onClick={signOut}>
                {hr.shell.signOut}
            </Button>
        </Container>
    )
}
