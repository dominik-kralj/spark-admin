import { Button, Dialog, Portal, Stack } from '@chakra-ui/react'
import { useRef } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import type { DiscardDialogState } from '@/shared/lib/useUnsavedChangesGuard'

export function DiscardChangesDialog({ isOpen, onDiscard, onKeepEditing }: DiscardDialogState) {
    const t = useStrings()
    const keepEditingRef = useRef<HTMLButtonElement>(null)

    return (
        <Dialog.Root
            role="alertdialog"
            open={isOpen}
            onOpenChange={({ open }) => {
                if (!open) onKeepEditing()
            }}
            initialFocusEl={() => keepEditingRef.current}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop bg="spark.scrim" />
                <Dialog.Positioner px="4">
                    <Dialog.Content maxW="md">
                        <Dialog.Header>
                            <Dialog.Title color="spark.heading">
                                {t.forms.discard.title}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Dialog.Description>{t.forms.discard.description}</Dialog.Description>
                        </Dialog.Body>

                        <Dialog.Footer asChild>
                            <Stack direction={{ base: 'column-reverse', sm: 'row' }} gap="2">
                                <Button
                                    variant="outline"
                                    color="fg.error"
                                    w={{ base: 'full', sm: 'auto' }}
                                    onClick={onDiscard}
                                >
                                    {t.forms.discard.confirm}
                                </Button>
                                <Button
                                    ref={keepEditingRef}
                                    colorPalette="blue"
                                    w={{ base: 'full', sm: 'auto' }}
                                    onClick={onKeepEditing}
                                >
                                    {t.forms.discard.keepEditing}
                                </Button>
                            </Stack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
