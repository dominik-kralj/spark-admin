import { Badge } from '@chakra-ui/react'
import { CalendarX, Check } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

import type { Validity } from '../lib/validity'

const chips = {
    valid: { colorPalette: 'green', Icon: Check },
    expired: { colorPalette: 'red', Icon: CalendarX },
} as const

export function ValidityChip({ validity }: { validity: Validity }) {
    const t = useStrings()
    const { colorPalette, Icon } = chips[validity]

    return (
        <Badge colorPalette={colorPalette} size="md">
            <Icon size="14" aria-hidden="true" />
            {t.privilegedOwners.status[validity]}
        </Badge>
    )
}
