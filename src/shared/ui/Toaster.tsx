import {
    Button,
    Toaster as ChakraToaster,
    Icon,
    IconButton,
    Portal,
    Stack,
    Toast,
} from '@chakra-ui/react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { toaster } from '@/shared/lib/toaster'

export function Toaster() {
    const t = useStrings()

    return (
        <Portal>
            <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
                {(toast) => (
                    <Toast.Root width={{ md: 'sm' }}>
                        <Icon
                            boxSize="5"
                            color={toast.type === 'error' ? 'fg.error' : 'fg.success'}
                        >
                            {toast.type === 'error' ? <CircleAlert /> : <CircleCheck />}
                        </Icon>
                        <Stack gap="1" flex="1" maxW="full">
                            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                            {toast.description && (
                                <Toast.Description>{toast.description}</Toast.Description>
                            )}
                            {toast.action && (
                                <Toast.ActionTrigger asChild>
                                    <Button variant="outline" size="sm" alignSelf="flex-start">
                                        {toast.action.label}
                                    </Button>
                                </Toast.ActionTrigger>
                            )}
                        </Stack>
                        <Toast.CloseTrigger asChild position="static">
                            <IconButton
                                aria-label={t.notifications.close}
                                variant="ghost"
                                size="sm"
                            >
                                <X />
                            </IconButton>
                        </Toast.CloseTrigger>
                    </Toast.Root>
                )}
            </ChakraToaster>
        </Portal>
    )
}
