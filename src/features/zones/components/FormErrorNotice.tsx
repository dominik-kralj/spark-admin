import { Alert } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'

// Not focused: focus goes to the first invalid field, which reads its own message.
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
