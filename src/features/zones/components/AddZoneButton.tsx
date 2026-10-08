import { Button } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { hr } from '@/shared/i18n/hr'

export function AddZoneButton() {
    return (
        <Button colorPalette="blue">
            <Plus aria-hidden="true" />
            {hr.zones.add}
        </Button>
    )
}
