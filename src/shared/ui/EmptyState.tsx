import { Box, EmptyState as ChakraEmptyState } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description: string
    action?: ReactNode
    role?: 'alert'
}

export function EmptyState({ icon, title, description, action, role }: EmptyStateProps) {
    return (
        <ChakraEmptyState.Root role={role}>
            <ChakraEmptyState.Content>
                <ChakraEmptyState.Indicator aria-hidden="true">{icon}</ChakraEmptyState.Indicator>
                <ChakraEmptyState.Title as="h2">{title}</ChakraEmptyState.Title>
                <ChakraEmptyState.Description>{description}</ChakraEmptyState.Description>
                {action !== undefined && <Box mt="1">{action}</Box>}
            </ChakraEmptyState.Content>
        </ChakraEmptyState.Root>
    )
}
