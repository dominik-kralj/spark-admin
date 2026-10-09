import {
    Box,
    Button,
    IconButton,
    Portal,
    Stack,
    Text,
    Tooltip,
    VisuallyHidden,
} from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
import { useId } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

import { hasIssuedTickets } from '../lib/canDelete'
import { fullName } from '../lib/fullName'
import type { Inspector } from '../validators/inspector'

interface InspectorDeleteButtonProps {
    inspector: Inspector
    onDelete: (inspector: Inspector) => void
    /** A table row has room for an icon only; a card and the form show the reason as text. */
    placement: 'row' | 'card' | 'form'
}

/** Disabled, with the reason, for an inspector who issued tickets: they can only be deactivated. */
export function InspectorDeleteButton({
    inspector,
    onDelete,
    placement,
}: InspectorDeleteButtonProps) {
    const t = useStrings()
    const strings = t.inspectors.delete
    const reasonId = useId()
    const isBlocked = hasIssuedTickets(inspector)
    const reason = strings.onlyDeactivate(inspector.ticketCount ?? 0)
    const buttonProps = {
        colorPalette: 'red',
        disabled: isBlocked,
        'aria-describedby': isBlocked ? reasonId : undefined,
        onClick: () => {
            onDelete(inspector)
        },
    }

    if (placement === 'row') {
        return (
            <>
                <Tooltip.Root disabled={!isBlocked} openDelay={300}>
                    {/* A disabled button takes no pointer events, so the tooltip hangs on its wrapper. */}
                    <Tooltip.Trigger asChild>
                        <Box as="span" display="inline-flex">
                            <IconButton
                                aria-label={strings.deleteInspector(fullName(inspector))}
                                variant="outline"
                                size="sm"
                                {...buttonProps}
                            >
                                <Trash2 aria-hidden="true" />
                            </IconButton>
                        </Box>
                    </Tooltip.Trigger>
                    <Portal>
                        <Tooltip.Positioner>
                            <Tooltip.Content>{reason}</Tooltip.Content>
                        </Tooltip.Positioner>
                    </Portal>
                </Tooltip.Root>
                {isBlocked && <VisuallyHidden id={reasonId}>{reason}</VisuallyHidden>}
            </>
        )
    }

    return (
        <Stack gap="1" align={placement === 'form' ? 'flex-start' : 'stretch'}>
            <Button
                aria-label={
                    placement === 'card' ? strings.deleteInspector(fullName(inspector)) : undefined
                }
                variant={placement === 'form' ? 'ghost' : 'outline'}
                size={placement === 'card' ? 'sm' : 'md'}
                {...buttonProps}
            >
                <Trash2 aria-hidden="true" />
                {placement === 'form' ? strings.formButton : strings.button}
            </Button>
            {isBlocked && (
                <Text id={reasonId} textStyle="sm" color="fg.muted">
                    {reason}
                </Text>
            )}
        </Stack>
    )
}
