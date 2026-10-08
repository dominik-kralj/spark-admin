import { Alert } from '@chakra-ui/react'
import { CalendarX } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { formatDate } from '@/shared/lib/format'

export function ExpiredNote({ validUntil }: { validUntil: Date }) {
    const t = useStrings()

    return (
        <Alert.Root role="status" status="error">
            <Alert.Indicator>
                <CalendarX />
            </Alert.Indicator>
            <Alert.Description>
                <strong>{t.privilegedOwners.form.expired(formatDate(validUntil))}</strong>{' '}
                {t.privilegedOwners.form.expiredNote}
            </Alert.Description>
        </Alert.Root>
    )
}
