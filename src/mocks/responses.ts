import { HttpResponse } from 'msw'
import type { z } from 'zod'

/** ASP.NET Core's ValidationProblemDetails: one entry per invalid request property. */
export function validationProblem(error: z.ZodError): Response {
    const errors: Record<string, string[]> = {}
    // ValidationProblemDetails puts errors about the body as a whole under '$'.
    for (const issue of error.issues) errors[issue.path.join('.') || '$'] = ['invalid']

    return HttpResponse.json({ status: 400, errors }, { status: 400 })
}

export const notFound = () => new HttpResponse(null, { status: 404 })
