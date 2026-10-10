import { z } from 'zod'

import { nextDay, startOfZagrebDay } from '@/shared/lib/calendarDate'

import type { ReportParams } from './reportForm'

export const reportListResponseSchema = z.array(
    z.object({ reportKey: z.string(), name: z.string() }),
)

export interface ReportDefinition {
    key: string
    name: string
}

export function toReportDefinitions(
    raw: z.output<typeof reportListResponseSchema>,
): ReportDefinition[] {
    return raw.map(({ reportKey, name }) => ({ key: reportKey, name }))
}

const reportValueSchema = z.union([z.string(), z.number()])

const reportRowSchema = z.record(z.string(), reportValueSchema)

export const reportPreviewResponseSchema = z.object({
    columns: z.array(
        z.object({
            key: z.string(),
            label: z.string(),
            // A kind this screen does not know yet still shows, as plain text.
            type: z.enum(['text', 'date', 'count', 'amount']).catch('text'),
        }),
    ),
    rows: z.array(reportRowSchema),
    totals: reportRowSchema.nullable(),
})

type RawReportPreview = z.output<typeof reportPreviewResponseSchema>

export type ReportColumnType = RawReportPreview['columns'][number]['type']

export type ReportValue = string | number | null

export interface ReportColumn {
    label: string
    type: ReportColumnType
}

/** A report's table: every row holds one value per column, in column order. */
export interface ReportPreview {
    columns: ReportColumn[]
    rows: ReportValue[][]
    totals: ReportValue[] | null
}

export function toReportPreview({ columns, rows, totals }: RawReportPreview): ReportPreview {
    const inColumnOrder = (row: Record<string, string | number>) =>
        columns.map(({ key }) => row[key] ?? null)

    return {
        columns: columns.map(({ label, type }) => ({ label, type })),
        rows: rows.map(inColumnOrder),
        totals: totals === null ? null : inColumnOrder(totals),
    }
}

/** The query (and the e-mail body) every report call takes: instants, the end exclusive. */
export function toReportQuery({ from, to, zoneId }: ReportParams) {
    return {
        dateFrom: startOfZagrebDay(from).toISOString(),
        dateTo: startOfZagrebDay(nextDay(to)).toISOString(),
        ...(zoneId !== null && { zoneId }),
    }
}

// Only the fields the report screen shows; Postavke grada owns the full shape.
export const reportRecipientResponseSchema = z.object({
    tenantName: z.string(),
    reportEmail: z.string().nullish(),
})

export interface ReportRecipient {
    cityName: string
    /** The preset address reports are sent to; null while the city has none. */
    email: string | null
}

export function toReportRecipient({
    tenantName,
    reportEmail,
}: z.output<typeof reportRecipientResponseSchema>): ReportRecipient {
    const email = reportEmail?.trim() ?? ''

    return { cityName: tenantName, email: email === '' ? null : email }
}
