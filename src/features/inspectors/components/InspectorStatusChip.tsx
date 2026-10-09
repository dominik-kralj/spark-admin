import { Check, CircleMinus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { StatusChip, type StatusChipStyle } from '@/shared/ui/StatusChip'

const chips: Record<'active' | 'inactive', StatusChipStyle> = {
    active: { colorPalette: 'green', Icon: Check },
    inactive: { colorPalette: 'gray', Icon: CircleMinus },
}

export function InspectorStatusChip({ isActive }: { isActive: boolean }) {
    const t = useStrings()
    const status = isActive ? 'active' : 'inactive'

    return <StatusChip {...chips[status]} label={t.inspectors.status[status]} />
}
