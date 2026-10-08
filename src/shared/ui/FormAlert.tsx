import { Alert } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'

import { useStrings } from '@/shared/i18n/useStrings'
import { focusOnMount } from '@/shared/lib/focusOnMount'
import { formErrorMessage } from '@/shared/lib/formErrorMessage'

/** A save error that belongs to no field. Key it by attempt, so a repeated failure takes focus again. */
export function FormAlert({ error }: { error: Error }) {
    const t = useStrings()

    return (
        <Alert.Root ref={focusOnMount} role="alert" tabIndex={-1} status="error">
            <Alert.Indicator>
                <CircleAlert />
            </Alert.Indicator>
            <Alert.Description>
                <strong>{t.forms.saveFailed}</strong> {formErrorMessage(error, t)}
            </Alert.Description>
        </Alert.Root>
    )
}
