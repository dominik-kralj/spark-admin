import { Heading, Stack } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
    const headingId = useId()

    return (
        <Stack as="section" aria-labelledby={headingId} gap="5">
            <Heading as="h2" id={headingId} textStyle="lg" color="spark.heading">
                {title}
            </Heading>
            {children}
        </Stack>
    )
}
