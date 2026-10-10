import { Field } from '@chakra-ui/react'
import { CircleAlert } from 'lucide-react'
import { useId, type ReactNode } from 'react'

export interface FieldControlProps {
    'aria-describedby': string | undefined
}

interface FormFieldProps {
    label: string
    /** The control's id, for a link that points at the field. */
    id?: string
    helperText?: string | undefined
    error?: string | undefined
    /** For a form that shows its errors together elsewhere: the text stays for screen readers. */
    isErrorTextHidden?: boolean
    children: (control: FieldControlProps) => ReactNode
}

export function FormField({
    label,
    id,
    helperText,
    error,
    isErrorTextHidden = false,
    children,
}: FormFieldProps) {
    const helperTextId = useId()
    const errorTextId = useId()
    // Chakra links the error only via aria-errormessage, which few screen readers announce.
    const describedBy = [helperText && helperTextId, error && errorTextId].filter(Boolean)

    return (
        <Field.Root
            id={id}
            invalid={Boolean(error)}
            ids={{ helperText: helperTextId, errorText: errorTextId }}
        >
            <Field.Label>{label}</Field.Label>
            {children({ 'aria-describedby': describedBy.join(' ') || undefined })}
            {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
            <Field.ErrorText srOnly={isErrorTextHidden}>
                <CircleAlert size="14" />
                {error}
            </Field.ErrorText>
        </Field.Root>
    )
}
