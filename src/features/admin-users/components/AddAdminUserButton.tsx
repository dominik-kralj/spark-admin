import { Button } from '@chakra-ui/react'
import { Plus } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'

/** The text button from md; the phone header has its own icon button. */
export function AddAdminUserButton({ onClick }: { onClick: () => void }) {
    const t = useStrings()

    return (
        <Button hideBelow="md" colorPalette="blue" onClick={onClick}>
            <Plus aria-hidden="true" />
            {t.adminUsers.add}
        </Button>
    )
}
