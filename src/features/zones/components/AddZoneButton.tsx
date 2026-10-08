import { Button } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

export function AddZoneButton({ onClick }: { onClick: () => void }) {
    const t = useStrings()

    return (
        <Button colorPalette="blue" onClick={onClick}>
            <Plus aria-hidden="true" />
            {t.zones.add}
        </Button>
    )
}
