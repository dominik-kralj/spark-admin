import { Button, Container, Heading } from '@chakra-ui/react'

import { useAuth } from '@/features/auth/api/useAuth'
import { hr } from '@/shared/i18n/hr'

export function HomePage() {
    const { signOut } = useAuth()

    return (
        <Container as="main" py="8">
            <Heading as="h1" color="spark.heading">
                {hr.app.name}
            </Heading>

            <Button variant="outline" mt="6" onClick={signOut}>
                {hr.shell.signOut}
            </Button>
        </Container>
    )
}
