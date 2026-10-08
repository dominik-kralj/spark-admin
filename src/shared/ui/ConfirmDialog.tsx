import { Button, Dialog, Portal, Stack, type ButtonProps } from '@chakra-ui/react'
import { useRef, type ReactNode } from 'react'

// Both designs: the outlined button first, the solid one second (on top when stacked on a phone).
const tones = {
    destructive: {
        cancel: { variant: 'outline' },
        confirm: { variant: 'solid', colorPalette: 'red' },
        isConfirmFirst: false,
    },
    discard: {
        cancel: { variant: 'solid', colorPalette: 'blue' },
        confirm: { variant: 'outline', color: 'fg.error' },
        isConfirmFirst: true,
    },
} satisfies Record<string, { cancel: ButtonProps; confirm: ButtonProps; isConfirmFirst: boolean }>

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    description: string
    confirmLabel: string
    cancelLabel: string
    tone: keyof typeof tones
    isConfirming?: boolean
    /** Shown above the buttons, e.g. why the last attempt failed. */
    error?: ReactNode
    onConfirm: () => void
    onCancel: () => void
    /** Where focus goes on close when the opening button no longer exists. */
    finalFocusEl?: () => HTMLElement | null
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmLabel,
    cancelLabel,
    tone,
    isConfirming = false,
    error,
    onConfirm,
    onCancel,
    finalFocusEl,
}: ConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null)
    const { cancel, confirm, isConfirmFirst } = tones[tone]

    const cancelButton = (
        <Button
            ref={cancelRef}
            {...cancel}
            w={{ base: 'full', sm: 'auto' }}
            disabled={isConfirming}
            onClick={onCancel}
        >
            {cancelLabel}
        </Button>
    )
    const confirmButton = (
        <Button
            {...confirm}
            w={{ base: 'full', sm: 'auto' }}
            loading={isConfirming}
            loadingText={confirmLabel}
            onClick={() => {
                if (!isConfirming) onConfirm()
            }}
        >
            {confirmLabel}
        </Button>
    )

    return (
        <Dialog.Root
            role="alertdialog"
            open={isOpen}
            onOpenChange={({ open }) => {
                if (!open && !isConfirming) onCancel()
            }}
            initialFocusEl={() => cancelRef.current}
            finalFocusEl={finalFocusEl}
            placement="center"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner px="4">
                    <Dialog.Content maxW="md">
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap="4">
                                <Dialog.Description>{description}</Dialog.Description>
                                {error}
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer asChild>
                            <Stack direction={{ base: 'column-reverse', sm: 'row' }} gap="2">
                                {isConfirmFirst ? confirmButton : cancelButton}
                                {isConfirmFirst ? cancelButton : confirmButton}
                            </Stack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
