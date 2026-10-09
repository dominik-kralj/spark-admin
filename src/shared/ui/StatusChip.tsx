import { Badge } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'

export interface StatusChipStyle {
    colorPalette: string
    Icon: LucideIcon
}

interface StatusChipProps extends StatusChipStyle {
    label: string
}

/** A status as an icon and a word, never by colour alone. */
export function StatusChip({ colorPalette, Icon, label }: StatusChipProps) {
    return (
        <Badge colorPalette={colorPalette} size="md">
            <Icon size="14" aria-hidden="true" />
            {label}
        </Badge>
    )
}
