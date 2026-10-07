import { z } from 'zod'

// Only the field the shell shows; Postavke grada (#32) owns the full shape.
export const tenantResponseSchema = z.object({
    tenantName: z.string(),
})

export function toCityName({ tenantName }: z.output<typeof tenantResponseSchema>): string {
    return tenantName
}
