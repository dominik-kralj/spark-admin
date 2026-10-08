import { Button } from '@chakra-ui/react'
import { Plus } from 'lucide-react'
import type { Ref } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'

interface AddPrivilegedOwnerButtonProps {
    onClick: () => void
    ref?: Ref<HTMLButtonElement> | undefined
}

/** The text button from md; the phone header has its own icon button. */
export function AddPrivilegedOwnerButton({ onClick, ref }: AddPrivilegedOwnerButtonProps) {
    const t = useStrings()

    return (
        <Button ref={ref} hideBelow="md" colorPalette="blue" onClick={onClick}>
            <Plus aria-hidden="true" />
            {t.privilegedOwners.add}
        </Button>
    )
}
