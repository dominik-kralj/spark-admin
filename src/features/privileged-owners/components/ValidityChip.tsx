import { CalendarX, Check } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { StatusChip, type StatusChipStyle } from '@/shared/ui/StatusChip'

import type { Validity } from '../lib/validity'

const chips: Record<Validity, StatusChipStyle> = {
    valid: { colorPalette: 'green', Icon: Check },
    expired: { colorPalette: 'red', Icon: CalendarX },
}

export function ValidityChip({ validity }: { validity: Validity }) {
    const t = useStrings()

    return <StatusChip {...chips[validity]} label={t.privilegedOwners.status[validity]} />
}
