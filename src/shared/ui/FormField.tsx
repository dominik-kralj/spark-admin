import { Field } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'
import { useId, type ReactNode } from 'react'

export interface FieldControlProps {
    'aria-describedby': string | undefined
}

interface FormFieldProps {
    label: string
    helperText?: string
    /** The message from the dictionary; undefined while the field is valid. */
    error?: string | undefined
    /** Spread the props on the control, so it is described by the helper and the error. */
    children: (control: FieldControlProps) => ReactNode
}

export function FormField({ label, helperText, error, children }: FormFieldProps) {
    const helperTextId = useId()
    const errorTextId = useId()
    // Chakra links the error only via aria-errormessage, which few screen readers announce.
    const describedBy = [helperText && helperTextId, error && errorTextId].filter(Boolean)

    return (
        <Field.Root
            invalid={error !== undefined}
            ids={{ helperText: helperTextId, errorText: errorTextId }}
        >
            <Field.Label>{label}</Field.Label>
            {children({ 'aria-describedby': describedBy.join(' ') || undefined })}
            {helperText && <Field.HelperText fontSize="caption">{helperText}</Field.HelperText>}
            <Field.ErrorText fontSize="caption">
                <CircleAlert size="14" />
                {error}
            </Field.ErrorText>
        </Field.Root>
    )
}
