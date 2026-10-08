import { Button, Drawer, Flex, IconButton, Portal, Stack } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { useRef, type SubmitEventHandler, type ReactNode } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { useUnsavedChangesGuard } from '@/shared/lib/useUnsavedChangesGuard'

import { DiscardChangesDialog } from './DiscardChangesDialog'
import { NavigationGuard } from './NavigationGuard'

interface FormDrawerProps {
    isOpen: boolean
    title: string
    /** After a successful save, close with onClose before navigating, or the guard still asks. */
    isDirty: boolean
    isSaving: boolean
    isSaveDisabled?: boolean
    /** Sits apart from Spremi: on the left on desktop, last on a phone. */
    destructiveAction?: ReactNode
    onClose: () => void
    onSubmit: SubmitEventHandler<HTMLFormElement>
    /** Where focus goes on close when the opening button no longer exists. */
    finalFocusEl?: () => HTMLElement | null
    children: ReactNode
}

export function FormDrawer({
    isOpen,
    title,
    isDirty,
    isSaving,
    isSaveDisabled = false,
    destructiveAction,
    onClose,
    onSubmit,
    finalFocusEl,
    children,
}: FormDrawerProps) {
    const t = useStrings()
    const titleRef = useRef<HTMLHeadingElement>(null)
    const { guardLeave, dialog } = useUnsavedChangesGuard(isDirty)

    function requestClose() {
        guardLeave(onClose)
    }

    return (
        <>
            <Drawer.Root
                open={isOpen}
                onOpenChange={({ open }) => {
                    if (!open) requestClose()
                }}
                initialFocusEl={() => titleRef.current}
                finalFocusEl={finalFocusEl}
                lazyMount
                unmountOnExit
            >
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content w="full" maxW={{ base: '100vw', md: '560px' }}>
                            <Flex
                                direction={{ base: 'row', md: 'row-reverse' }}
                                justify={{ base: 'flex-start', md: 'space-between' }}
                                align="center"
                                gap={{ base: '1', md: '4' }}
                                minH="14"
                                py={{ md: '4' }}
                                pl={{ base: '1.5', md: '6' }}
                                pr="4"
                                flex="none"
                                borderBottomWidth="1px"
                                borderColor="border"
                            >
                                <Drawer.CloseTrigger asChild position="static">
                                    <IconButton aria-label={t.forms.close} variant="ghost">
                                        <X />
                                    </IconButton>
                                </Drawer.CloseTrigger>
                                <Drawer.Title ref={titleRef} tabIndex={-1} textStyle="lg">
                                    {title}
                                </Drawer.Title>
                            </Flex>

                            <Flex asChild direction="column" flex="1" minH="0">
                                <form noValidate onSubmit={onSubmit}>
                                    <Drawer.Body p={{ base: '4', md: '6' }}>
                                        <Stack gap="5">{children}</Stack>
                                    </Drawer.Body>

                                    <Drawer.Footer
                                        borderTopWidth="1px"
                                        borderColor="border"
                                        px={{ base: '4', md: '6' }}
                                        py="4"
                                    >
                                        <Stack
                                            direction={{ base: 'column-reverse', md: 'row' }}
                                            justify="space-between"
                                            gap={{ base: '2', md: '3' }}
                                            w="full"
                                        >
                                            {destructiveAction}
                                            <Stack
                                                direction={{ base: 'column-reverse', md: 'row' }}
                                                gap={{ base: '2', md: '3' }}
                                                ms={{ md: 'auto' }}
                                            >
                                                <Button variant="outline" onClick={requestClose}>
                                                    {t.forms.cancel}
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    colorPalette="blue"
                                                    loading={isSaving}
                                                    disabled={isSaveDisabled}
                                                    loadingText={t.forms.save}
                                                >
                                                    {t.forms.save}
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Drawer.Footer>
                                </form>
                            </Flex>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>

            <DiscardChangesDialog {...dialog} />
            {isOpen && <NavigationGuard hasUnsavedChanges={isDirty} />}
        </>
    )
}
