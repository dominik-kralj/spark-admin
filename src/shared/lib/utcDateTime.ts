import { z } from 'zod'

const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/i

/** An API date-time as a Date. SQL Server's DATETIME2 has no offset, so one without is UTC. */
export const utcDateTimeSchema = z.iso
    .datetime({ offset: true, local: true })
    .transform((value) => new Date(hasOffset.test(value) ? value : `${value}Z`))
