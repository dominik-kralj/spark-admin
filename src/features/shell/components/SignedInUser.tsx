import { HStack, Span } from '@chakra-ui/react'
import { User } from 'lucide-react'

export function SignedInUser({ name }: { name: string }) {
    return (
        <HStack gap="2" color="gray.fg">
            <User size="18" aria-hidden="true" />
            <Span>{name}</Span>
        </HStack>
    )
}
