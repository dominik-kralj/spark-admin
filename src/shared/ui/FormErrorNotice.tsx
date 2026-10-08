import { Alert } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'

/** A failed save's one-line notice; focus goes to the first invalid field, not here. */
export function FormErrorNotice({ message }: { message: string }) {
    return (
        <Alert.Root role="alert" status="error">
            <Alert.Indicator>
                <CircleAlert />
            </Alert.Indicator>
            <Alert.Description>{message}</Alert.Description>
        </Alert.Root>
    )
}
