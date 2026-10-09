import type { Dictionary } from '@/shared/i18n/dictionary'
import { formatCalendarDate } from '@/shared/lib/format'

import type { ZoneOption } from '../validators/zoneOption'

import type { TicketFilterValues } from './ticketFilterValues'

export interface FilterTag {
    id: 'plate' | 'range' | 'zone' | 'fiscal'
    label: string
    /** The filters once this tag is removed. */
    without: TicketFilterValues
}

interface FilterTagsArgs {
    values: TicketFilterValues
    zones: ZoneOption[]
    t: Dictionary
}

function rangeLabel(
    { from, to }: TicketFilterValues,
    tags: Dictionary['tickets']['filters']['tags'],
) {
    if (from !== null && to !== null) {
        return tags.range(formatCalendarDate(from), formatCalendarDate(to))
    }
    if (from !== null) return tags.rangeFrom(formatCalendarDate(from))
    if (to !== null) return tags.rangeTo(formatCalendarDate(to))

    return null
}

/** One tag per active filter, in the order of the filter bar; the date range is one tag. */
export function filterTags({ values, zones, t }: FilterTagsArgs): FilterTag[] {
    const { tags } = t.tickets.filters
    const range = rangeLabel(values, tags)
    const zoneCode = zones.find((zone) => zone.id === values.zoneId)?.code ?? String(values.zoneId)
    const candidates: (FilterTag | false)[] = [
        values.plate !== '' && {
            id: 'plate',
            label: tags.plate(values.plate),
            without: { ...values, plate: '' },
        },
        range !== null && {
            id: 'range',
            label: range,
            without: { ...values, from: null, to: null },
        },
        values.zoneId !== null && {
            id: 'zone',
            label: tags.zone(zoneCode),
            without: { ...values, zoneId: null },
        },
        values.fiscalStatus !== null && {
            id: 'fiscal',
            label: tags.fiscal(t.processingStatus.fiscal[values.fiscalStatus]),
            without: { ...values, fiscalStatus: null },
        },
    ]

    return candidates.filter((tag) => tag !== false)
}
