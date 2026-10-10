import { Input } from '@chakra-ui/react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { readDateText } from '@/shared/lib/validation'

import { DateInput } from './DateInput'
import { FormField } from './FormField'

interface RangeDateFieldProps {
    label: string
    /** Which end of the range this field is. */
    end: 'from' | 'to'
    /** The text in this field, and in the field for the other end. */
    value: string
    otherValue: string
    error: string | undefined
    registration: UseFormRegisterReturn
    onPick: (text: string) => void
}

/** One end of a date range, typed or picked, with a calendar that keeps the range in order. */
export function RangeDateField({
    label,
    end,
    value,
    otherValue,
    error,
    registration,
    onPick,
}: RangeDateFieldProps) {
    const other = readDateText(otherValue)
    const bound = 'date' in other ? other.date : undefined

    return (
        <FormField label={label} error={error}>
            {(control) => (
                <DateInput
                    label={label}
                    value={value}
                    min={end === 'to' ? bound : undefined}
                    max={end === 'from' ? bound : undefined}
                    onPick={onPick}
                >
                    <Input {...registration} {...control} inputMode="numeric" autoComplete="off" />
                </DateInput>
            )}
        </FormField>
    )
}
