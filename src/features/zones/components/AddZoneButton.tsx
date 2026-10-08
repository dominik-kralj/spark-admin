import { Button } from '@chakra-ui/react'
import type { Ref } from 'react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

interface AddZoneButtonProps {
    onClick: () => void
    ref?: Ref<HTMLButtonElement>
}

export function AddZoneButton({ onClick, ref }: AddZoneButtonProps) {
    const t = useStrings()

    return (
        <Button ref={ref} colorPalette="blue" onClick={onClick}>
            <Plus aria-hidden="true" />
            {t.zones.add}
        </Button>
    )
}
