import {
    DatePicker,
    IconButton,
    InputGroup,
    parseDate,
    type DateValue,
    type InputElementProps,
} from '@chakra-ui/react'
import { CalendarDays } from 'lucide-react'
import type { ReactElement } from 'react'

import { useStrings } from '@/shared/i18n/useStrings'
import { toIsoDate, type CalendarDate } from '@/shared/lib/calendarDate'
import { formatCalendarDate } from '@/shared/lib/format'
import { readDateText } from '@/shared/lib/validation'

interface DateInputProps {
    /** The field's label, so each calendar button has its own name. */
    label: string
    /** The text in the field; the calendar opens on it when it is a date. */
    value: string
    /** A day picked in the calendar, as DD.MM.GGGG text for the field. */
    onPick: (text: string) => void
    /** The first and last day the calendar lets the user pick. */
    min?: CalendarDate | undefined
    max?: CalendarDate | undefined
    /** The text input the user types into. */
    children: ReactElement<InputElementProps>
}

function toDateValue(date: CalendarDate): DateValue {
    return parseDate(toIsoDate(date))
}

/** A typed DD.MM.GGGG field with a calendar button beside it. */
export function DateInput({ label, value, onPick, min, max, children }: DateInputProps) {
    const t = useStrings()
    const strings = t.forms.datePicker
    const typed = readDateText(value)

    return (
        <DatePicker.Root
            locale={strings.locale}
            startOfWeek={1}
            // Inside a Field the picker adopts the field's input and writes to it in this format.
            format={formatCalendarDate}
            value={'date' in typed ? [toDateValue(typed.date)] : []}
            min={min && toDateValue(min)}
            max={max && toDateValue(max)}
            onValueChange={({ value: [picked] }) => {
                if (picked !== undefined) onPick(formatCalendarDate(picked))
            }}
            translations={{
                trigger: (isOpen) => (isOpen ? strings.close(label) : strings.open(label)),
                content: strings.calendar,
                dayCell: (cell) =>
                    cell.selected ? strings.selected(cell.valueText) : cell.valueText,
                prevTrigger: (view) => strings.previous[view],
                nextTrigger: (view) => strings.next[view],
                viewTrigger: (view, nextView) => strings.show[nextView ?? view],
            }}
        >
            <DatePicker.Control>
                <InputGroup
                    endElement={
                        <DatePicker.Trigger asChild unstyled>
                            <IconButton variant="ghost" size="xs">
                                <CalendarDays aria-hidden="true" />
                            </IconButton>
                        </DatePicker.Trigger>
                    }
                    endElementProps={{ pe: '1', pointerEvents: 'auto' }}
                >
                    {children}
                </InputGroup>
            </DatePicker.Control>

            {/* Not portalled: the form drawer traps focus, so the calendar must sit inside it. */}
            <DatePicker.Positioner>
                <DatePicker.Content>
                    <DatePicker.View view="day">
                        <DatePicker.Header />
                        <DatePicker.DayTable />
                    </DatePicker.View>
                    <DatePicker.View view="month">
                        <DatePicker.Header />
                        <DatePicker.MonthTable />
                    </DatePicker.View>
                    <DatePicker.View view="year">
                        <DatePicker.Header />
                        <DatePicker.YearTable />
                    </DatePicker.View>
                </DatePicker.Content>
            </DatePicker.Positioner>
        </DatePicker.Root>
    )
}
