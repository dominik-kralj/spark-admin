import { Alert } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'

import { focusOnMount } from '@/shared/lib/focusOnMount'

interface ErrorAlertProps {
    title?: string
    message: string
    /** For an error nothing else points to; mount it anew per attempt so it takes focus again. */
    takesFocus?: boolean
}

export function ErrorAlert({ title, message, takesFocus = false }: ErrorAlertProps) {
    return (
        <Alert.Root
            ref={takesFocus ? focusOnMount : undefined}
            role="alert"
            tabIndex={takesFocus ? -1 : undefined}
            status="error"
        >
            <Alert.Indicator>
                <CircleAlert />
            </Alert.Indicator>
            <Alert.Description>
                {title && <strong>{title} </strong>}
                {message}
            </Alert.Description>
        </Alert.Root>
    )
}
