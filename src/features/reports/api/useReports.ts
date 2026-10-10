import { queryOptions, skipToken, useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { request, requestFile } from '@/shared/api'
import { tenantKeys } from '@/shared/lib/tenantKeys'

import {
    reportListResponseSchema,
    reportPreviewResponseSchema,
    reportRecipientResponseSchema,
    toReportDefinitions,
    toReportPreview,
    toReportQuery,
    toReportRecipient,
} from '../validators/report'
import type { ReportParams } from '../validators/reportForm'

const reportKeys = {
    list: ['reports', 'list'] as const,
    preview: (params: ReportParams | null) => ['reports', 'preview', params] as const,
}

function reportPath(params: ReportParams, action: 'preview' | 'pdf' | 'email') {
    return `/reports/${encodeURIComponent(params.reportKey)}/${action}`
}

const reportsQuery = queryOptions({
    queryKey: reportKeys.list,
    // The list changes only with a backend release.
    staleTime: Infinity,
    queryFn: async ({ signal }) =>
        toReportDefinitions(
            await request('/reports', { schema: reportListResponseSchema, signal }),
        ),
})

export function useReportDefinitions() {
    return useQuery(reportsQuery)
}

/** The preview of the report last asked for; nothing is fetched until `params` is set. */
export function useReportPreview(params: ReportParams | null) {
    return useQuery({
        queryKey: reportKeys.preview(params),
        queryFn:
            params === null
                ? skipToken
                : async ({ signal }) =>
                      toReportPreview(
                          await request(reportPath(params, 'preview'), {
                              query: toReportQuery(params),
                              schema: reportPreviewResponseSchema,
                              signal,
                          }),
                      ),
    })
}

/** The city's name for the preview heading and its preset address for sending. */
export function useReportRecipient() {
    return useQuery({
        queryKey: tenantKeys.reportRecipient,
        queryFn: async ({ signal }) =>
            toReportRecipient(
                await request('/tenant', { schema: reportRecipientResponseSchema, signal }),
            ),
    })
}

export function useExportReportPdf() {
    return useMutation({
        mutationFn: (params: ReportParams) =>
            requestFile(reportPath(params, 'pdf'), {
                accept: 'application/pdf',
                query: toReportQuery(params),
            }),
    })
}

export function useSendReportEmail() {
    return useMutation({
        mutationFn: async (params: ReportParams) => {
            await request(reportPath(params, 'email'), {
                method: 'POST',
                body: toReportQuery(params),
                schema: z.unknown(),
            })
        },
    })
}
