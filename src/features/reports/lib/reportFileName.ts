import { toIsoDate } from '@/shared/lib/calendarDate'

import type { ReportParams } from '../validators/reportForm'

export function reportFileName({ reportKey, from, to }: ReportParams): string {
    return `izvjestaj-${reportKey}-${toIsoDate(from)}-${toIsoDate(to)}.pdf`
}
