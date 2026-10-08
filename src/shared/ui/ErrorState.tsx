import { Button, Icon } from '@chakra-ui/react'
import { TriangleAlert } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { listErrorMessage } from '@/shared/lib/listErrorMessage'

import { EmptyState } from './EmptyState'

interface ErrorStateProps {
    title: string
    error: Error
    onRetry: () => void
    isRetrying: boolean
}

export function ErrorState({ title, error, onRetry, isRetrying }: ErrorStateProps) {
    const t = useStrings()

    return (
        <EmptyState
            role="alert"
            icon={
                <Icon color="fg.error">
                    <TriangleAlert />
                </Icon>
            }
            title={title}
            description={listErrorMessage(error, t)}
            action={
                <Button
                    colorPalette="blue"
                    loading={isRetrying}
                    loadingText={t.listStates.retry}
                    onClick={onRetry}
                >
                    {t.listStates.retry}
                </Button>
            }
        />
    )
}
