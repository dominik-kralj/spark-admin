import { Button, Drawer, Flex, IconButton, Portal } from '@chakra-ui/react'
import { ArrowLeft, X } from 'lucide-react'
import { useRef, type ReactNode, type RefObject } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

type TitleRef = RefObject<HTMLHeadingElement | null>

interface DetailDrawerProps {
    isOpen: boolean
    onClose: () => void
    /** A detail opened from its URL has no opener to return focus to; the row link is it. */
    finalFocusEl: () => HTMLElement | null
    /** The header and body; the title takes the ref, so it has focus once open. */
    children: (titleRef: TitleRef) => ReactNode
}

/** A list item's read-only detail: 560 px over the list from md, full screen below it. */
export function DetailDrawer({ isOpen, onClose, finalFocusEl, children }: DetailDrawerProps) {
    const t = useStrings()
    const titleRef = useRef<HTMLHeadingElement>(null)

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={({ open }) => {
                if (!open) onClose()
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
                        {children(titleRef)}

                        <Drawer.Footer
                            hideBelow="md"
                            borderTopWidth="1px"
                            borderColor="border"
                            px="6"
                            py="4"
                        >
                            <Drawer.ActionTrigger asChild>
                                <Button variant="outline">{t.details.close}</Button>
                            </Drawer.ActionTrigger>
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}

interface DetailDrawerHeaderProps {
    title: string
    titleRef: TitleRef
    /** The close button from md. */
    closeLabel: string
    /** The phone's back arrow, named by where it leads. */
    backLabel: string
}

export function DetailDrawerHeader({
    title,
    titleRef,
    closeLabel,
    backLabel,
}: DetailDrawerHeaderProps) {
    return (
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
            <Drawer.CloseTrigger asChild position="static" hideFrom="md">
                <IconButton aria-label={backLabel} variant="ghost">
                    <ArrowLeft aria-hidden="true" />
                </IconButton>
            </Drawer.CloseTrigger>
            <Drawer.CloseTrigger asChild position="static" hideBelow="md">
                <IconButton aria-label={closeLabel} variant="ghost">
                    <X aria-hidden="true" />
                </IconButton>
            </Drawer.CloseTrigger>
            <Drawer.Title ref={titleRef} tabIndex={-1} textStyle="lg">
                {title}
            </Drawer.Title>
        </Flex>
    )
}
