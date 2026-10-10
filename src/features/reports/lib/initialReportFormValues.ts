import { lastFullMonth, zagrebCalendarDate } from '@/shared/lib/calendarDate'

import { toReportFormValues, type ReportFormValues } from '../validators/reportForm'

/** The first report, for last month in every zone: what a monthly report run usually needs. */
export function initialReportFormValues(reportKey: string, now: Date): ReportFormValues {
    return toReportFormValues({
        reportKey,
        ...lastFullMonth(zagrebCalendarDate(now)),
        zoneId: null,
    })
}
