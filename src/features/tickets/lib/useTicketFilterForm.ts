import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'

import {
    ticketFilterFormSchema,
    toTicketFilterFormValues,
    type TicketFilterFormValues,
    type TicketFilterValues,
} from '../validators/ticketFilterForm'

export type TicketFilterForm = UseFormReturn<TicketFilterFormValues, unknown, TicketFilterValues>

/** The filter form, following `values` (the URL), and its submit handler. */
export function useTicketFilterForm(
    values: TicketFilterValues,
    onApply: (values: TicketFilterValues) => void,
) {
    const form = useForm({
        resolver: zodResolver(ticketFilterFormSchema),
        values: toTicketFilterFormValues(values),
    })

    return { form, submit: form.handleSubmit(onApply) }
}
