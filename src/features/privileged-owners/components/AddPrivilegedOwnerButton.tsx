import { Button } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

interface AddPrivilegedOwnerButtonProps {
    onClick: () => void
}

export function AddPrivilegedOwnerButton({ onClick }: AddPrivilegedOwnerButtonProps) {
    const t = useStrings()

    return (
        <Button colorPalette="blue" onClick={onClick}>
            <Plus aria-hidden="true" />
            {t.privilegedOwners.add}
        </Button>
    )
}
