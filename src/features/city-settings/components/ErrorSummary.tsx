import { Alert, Link, List } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'

import { focusOnMount } from '@/shared/lib/focusOnMount'

export interface ErrorSummaryItem {
    fieldId: string
    message: string
}

interface ErrorSummaryProps {
    title: string
    items: ErrorSummaryItem[]
}

/** Takes focus when it mounts; give it a new key per submit so it takes focus again. */
export function ErrorSummary({ title, items }: ErrorSummaryProps) {
    return (
        <Alert.Root ref={focusOnMount} role="alert" tabIndex={-1} status="error">
            <Alert.Indicator>
                <CircleAlert />
            </Alert.Indicator>
            <Alert.Content>
                <Alert.Title asChild fontWeight="semibold">
                    <h2>{title}</h2>
                </Alert.Title>
                <List.Root ps="4.5">
                    {items.map(({ fieldId, message }) => (
                        <List.Item key={fieldId}>
                            <Link
                                href={`#${fieldId}`}
                                display="inline-flex"
                                alignItems="center"
                                minH="11"
                                color="inherit"
                                onClick={(event) => {
                                    // Focus, not just scroll: the person can type straight away.
                                    event.preventDefault()
                                    document.getElementById(fieldId)?.focus()
                                }}
                            >
                                {message}
                            </Link>
                        </List.Item>
                    ))}
                </List.Root>
            </Alert.Content>
        </Alert.Root>
    )
}
