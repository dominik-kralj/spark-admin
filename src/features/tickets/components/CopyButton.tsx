import { Clipboard, IconButton } from '@chakra-ui/react'
import { Check, Copy } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { announce } from '@/shared/lib/announcer'

interface CopyButtonProps {
    value: string
    label: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
    const t = useStrings()

    return (
        <Clipboard.Root
            value={value}
            onStatusChange={({ copied }) => {
                if (copied) announce(t.tickets.detail.copied)
            }}
        >
            <Clipboard.Trigger asChild>
                <IconButton aria-label={label} variant="outline" size="sm">
                    <Clipboard.Indicator copied={<Check aria-hidden="true" />}>
                        <Copy aria-hidden="true" />
                    </Clipboard.Indicator>
                </IconButton>
            </Clipboard.Trigger>
        </Clipboard.Root>
    )
}
