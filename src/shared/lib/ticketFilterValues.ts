import { nextDay, readIsoDate, startOfZagrebDay, toIsoDate } from '@/shared/lib/calendarDate'
import { processingStatuses, type ProcessingStatus } from '@/shared/lib/processingStatus'
import type { SearchParamUpdates } from '@/shared/lib/useSearchParams'
import { normalisePlate } from '@/shared/lib/validation'

import type { TicketFilterValues } from './ticketFilterForm'

/** The filters a ticket list request takes: instants, not days. */
export interface TicketFilters {
    plate?: string
    /** Inclusive. */
    createdFrom?: Date
    /** Exclusive. */
    createdTo?: Date
    zoneId?: number
    fiscalStatus?: ProcessingStatus
}

export type TicketFilterKey = keyof TicketFilterValues

export const noFilterValues: TicketFilterValues = {
    plate: '',
    from: null,
    to: null,
    zoneId: null,
    fiscalStatus: null,
}

export const filterParams = {
    plate: 'plate',
    from: 'from',
    to: 'to',
    zoneId: 'zone',
    fiscalStatus: 'fiscal',
} as const satisfies Record<TicketFilterKey, string>

function readZoneId(text: string | null): number | null {
    const zoneId = Number(text)

    return text !== null && Number.isInteger(zoneId) && zoneId > 0 ? zoneId : null
}

function readFiscalStatus(text: string | null): ProcessingStatus | null {
    return processingStatuses.find((status) => status === text) ?? null
}

export function readFilterValues(searchParams: URLSearchParams): TicketFilterValues {
    const read = (key: TicketFilterKey) => searchParams.get(filterParams[key])

    return {
        plate: normalisePlate(read('plate') ?? ''),
        from: readIsoDate(read('from') ?? ''),
        to: readIsoDate(read('to') ?? ''),
        zoneId: readZoneId(read('zoneId')),
        fiscalStatus: readFiscalStatus(read('fiscalStatus')),
    }
}

/** A filter that is not set leaves the URL, so an unfiltered list keeps it clean. */
export function toFilterSearchParams(values: TicketFilterValues): SearchParamUpdates {
    return {
        [filterParams.plate]: values.plate === '' ? null : values.plate,
        [filterParams.from]: values.from && toIsoDate(values.from),
        [filterParams.to]: values.to && toIsoDate(values.to),
        [filterParams.zoneId]: values.zoneId === null ? null : String(values.zoneId),
        [filterParams.fiscalStatus]: values.fiscalStatus,
    }
}

/** Days are Zagreb days: from its first instant up to the first instant of the day after `to`. */
export function toTicketFilters({
    plate,
    from,
    to,
    zoneId,
    fiscalStatus,
}: TicketFilterValues): TicketFilters {
    return {
        ...(plate !== '' && { plate }),
        ...(from !== null && { createdFrom: startOfZagrebDay(from) }),
        ...(to !== null && { createdTo: startOfZagrebDay(nextDay(to)) }),
        ...(zoneId !== null && { zoneId }),
        ...(fiscalStatus !== null && { fiscalStatus }),
    }
}

/** The filters behind the Filteri button: the plate stays on the page, the range counts once. */
export function activeDrawerFilterCount({ from, to, zoneId, fiscalStatus }: TicketFilterValues) {
    return [from !== null || to !== null, zoneId !== null, fiscalStatus !== null].filter(Boolean)
        .length
}
