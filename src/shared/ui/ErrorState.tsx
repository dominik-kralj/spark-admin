import { Button, Icon } from '@chakra-ui/react'
import { TriangleAlert } from 'lucide-react'

import { hr } from '@/shared/i18n/hr'
import { listErrorMessage } from '@/shared/lib/listErrorMessage'

import { EmptyState } from './EmptyState'

interface ErrorStateProps {
    title: string
    error: Error
    onRetry: () => void
    isRetrying: boolean
}

export function ErrorState({ title, error, onRetry, isRetrying }: ErrorStateProps) {
    return (
        <EmptyState
            role="alert"
            icon={
                <Icon color="fg.error">
                    <TriangleAlert />
                </Icon>
            }
            title={title}
            description={listErrorMessage(error)}
            action={
                <Button
                    colorPalette="blue"
                    loading={isRetrying}
                    loadingText={hr.listStates.retry}
                    onClick={onRetry}
                >
                    {hr.listStates.retry}
                </Button>
            }
        />
    )
}
