import { NativeSelect } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { FormField } from '@/shared/ui/FormField'

import type { ReportForm } from '../validators/reportForm'

interface ReportSelectFieldProps {
    label: string
    error?: string | undefined
    registration: ReturnType<ReportForm['register']>
    children: ReactNode
}

export function ReportSelectField({
    label,
    error,
    registration,
    children,
}: ReportSelectFieldProps) {
    return (
        <FormField label={label} error={error}>
            {(control) => (
                <NativeSelect.Root>
                    <NativeSelect.Field {...registration} {...control}>
                        {children}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
            )}
        </FormField>
    )
}
