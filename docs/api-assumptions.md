# API assumptions

The spec defines no Admin endpoints. Everything below is what this frontend
assumes, for the backend team to confirm or correct. The code that depends on
each item lives in the feature's `api/` and `validators/`, or in
`src/shared/api/` for transport; update this file in the same change as that code.

## Transport

| Item       | Assumption                                                                                                                                | Source                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Origin     | `VITE_API_BASE_URL`, HTTPS                                                                                                                | spec: "Svi pozivi na WebAPI moraju ići preko HTTPS"                     |
| Base path  | `/api/v1/admin`; endpoint paths below are relative to it                                                                                  | spec: `AdminController` with `[Route("api/v1/[controller]")]`           |
| API key    | `X-API-KEY: <VITE_API_KEY>` on every request, including login                                                                             | spec: X-API-KEY Autorizacija                                            |
| Auth       | `Authorization: Bearer <JWT>` on every request once signed in                                                                             | spec: JWT Security token; handoff                                       |
| Bodies     | JSON both ways. Requests send `Content-Type: application/json` only when they have a body; every request sends `Accept: application/json` | assumed                                                                 |
| Casing     | camelCase property names (ASP.NET Core `System.Text.Json` default), e.g. `zoneId`, `tenantId`                                             | assumed; the spec's C# models are PascalCase and serialise to camelCase |
| Date-times | ISO 8601 strings in UTC with a `Z` suffix (`2026-10-06T14:30:00Z`); shown in local time                                                   | assumed                                                                 |
| Query      | Filters are query-string params; empty values (`undefined`, `null`, `''`) are left out                                                    | assumed                                                                 |
| No content | `204` or an empty body for calls that return nothing (e.g. DELETE)                                                                        | assumed                                                                 |

## Errors

Error bodies are assumed to be ASP.NET Core `ProblemDetails`
(`application/problem+json`). The error kind comes from the **status code
alone**; a missing, plain-text or HTML error body is handled the same way.
Messages shown to the user come from `hr.ts`, by error kind, and never from the
server.

The client keeps a JSON error body on `ApiError.body` (undefined when the body
is not JSON). `fieldErrorsFrom` (`shared/api/fieldErrors.ts`) reads it, to put
an error on the right form field, with the map from raw request property names
to form fields that a feature's `validators/` supply; raw names stay in the
feature. Two shapes are read (`api-contract.md` D2, open question #5):

```jsonc
// 400: ValidationProblemDetails; keys are request property names.
{ "status": 400, "errors": { "price": ["invalid"], "durationMinutes": ["invalid"] } }

// 409 duplicate: the request property that clashes.
{ "status": 409, "code": "duplicate", "field": "zoneCode" }
```

Any other body, or a key the feature does not know, gives no field error, and
the form falls back to the message for the error kind (`hr.forms.errors`). The
reason in each `errors` entry is not read: every listed field shows one
"invalid" message, and a duplicate shows one "already exists" message, unless
the feature words its own.

| Status             | `ApiError.kind`   | Notes                                                                                    |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------- |
| 400, 422           | `validation`      | field errors read from `errors` where a feature maps them (above)                        |
| 401                | `unauthorized`    | missing/invalid API key or JWT; wrong login. With a token sent, it also ends the session |
| 403                | `forbidden`       |                                                                                          |
| 404                | `notFound`        |                                                                                          |
| 409                | `conflict`        | e.g. duplicate (`field` read where a feature maps it), or a stale edit                   |
| 429                | `rateLimited`     | spec: login is limited to 5 per IP per minute                                            |
| 5xx, anything else | `server`          |                                                                                          |
| no response        | `network`         | `fetch` rejected (offline, DNS, CORS)                                                    |
| 2xx, bad body      | `invalidResponse` | body is not JSON or fails the response schema                                            |

A request cancelled through its `AbortSignal` (TanStack Query cancellation)
rejects with the original `AbortError`, not an `ApiError`.

## Endpoints

Each feature adds its endpoints and payload shapes here.

### Login (`src/features/auth/api/useAuth.ts`)

The spec has no Admin login (feature docs §5.12, `open-questions.md` #2). This
mirrors the Inspector `Login` action, with username and password in place of
`TenantId` and `PIN`.

`POST /login`, no `Authorization` header (the token does not exist yet), with
the `X-API-KEY` like every call.

```json
{ "username": "admin", "password": "…" }
```

`200`:

```json
{
  "token": "<JWT>",
  "user": {
    "adminUserId": 1,
    "tenantId": 1,
    "username": "admin",
    "name": "Ana",
    "surname": "Kovač"
  }
}
```

| Item          | Assumption                                                                            | Source                                       |
| ------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| Path          | `/login` under the Admin base path                                                    | spec: Inspector `[Route("login")]`           |
| Request       | `username` trimmed, `password` exactly as typed; no `tenantId` (open question #6)     | handoff: "Login (username, password)"        |
| Response      | `token` plus `user`, like the Inspector's `{ token, inspector }`                      | spec: Inspector `Login`                      |
| User fields   | `adminUserId`, `tenantId`, `username`, `name`, `surname`                              | assumed; `name`/`surname` as on INSPECTORS   |
| Wrong login   | `401` with no body; the UI does not say which value is wrong                          | spec: Inspector `Login` returns Unauthorized |
| Rate limit    | `429` after 5 requests per IP per minute, fixed window; the mock counts every request | spec: `LoginPolicy`                          |
| Token storage | `sessionStorage`, with the mapped user; see "Session" in `AGENTS.md`                  | #5                                           |
| Expiry        | not read; a `401` on any signed-in request ends the session (JWT lasts 10 h)          | feature docs: Inspector JWT; #5              |
| Logout        | local only: no endpoint is called, the token is dropped                               | assumed; the spec has no logout call         |

### City name (`src/features/shell/api/useCityName.ts`)

The shell header shows the city's name. Postavke grada (#32) will own the full
tenant shape; until then the shell reads only `tenantName` and ignores the
rest. The proposed full shape is in `api-contract.md` (ADM-8).

`GET /tenant`, `200`:

```json
{ "tenantName": "Grad Samobor", "…": "other CITY_TENANTS fields" }
```

| Item    | Assumption                                                                           | Source                          |
| ------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| Path    | `/tenant`, no id: the city comes from the JWT's `TenantId` claim                     | `api-contract.md` [proposed]    |
| Field   | `tenantName`, the display name shown as-is ("Grad Samobor")                          | spec: `CITY_TENANTS.TenantName` |
| Caching | read once per session; a failed call leaves the name out and the shell keeps working | assumed                         |

### Zones (`src/features/zones/api/useZones.ts`)

The shape is `api-contract.md` ADM-2: the ZONES columns in camelCase, without
`tenantId`. Mapping to the domain `Zone` (`id`, `code`, `name`, …) is in
`src/features/zones/validators/zone.ts`.

```json
{
  "zoneId": 1,
  "zoneCode": "ZONA1",
  "zoneName": "Prva zona",
  "price": 0.7,
  "dailyTicketPrice": 15,
  "durationMinutes": 60,
  "maxExtensions": 2,
  "dpkIssueDelayMinutes": 15
}
```

| Call                     | Body                  | Success      | Errors                                                          |
| ------------------------ | --------------------- | ------------ | --------------------------------------------------------------- |
| `GET /zones`             |                       | `200 Zone[]` |                                                                 |
| `POST /zones`            | zone without `zoneId` | `201 Zone`   | `400` field errors; `409 duplicate` on `zoneCode` or `zoneName` |
| `PUT /zones/{zoneId}`    | zone without `zoneId` | `200 Zone`   | same, plus `404`                                                |
| `DELETE /zones/{zoneId}` |                       | `204`        | `404`                                                           |

| Item       | Assumption                                                                                                                                                                                                               | Source                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| List       | a plain array of the signed-in city's zones, sorted in the browser; no paging                                                                                                                                            | `api-contract.md` Lists                                      |
| Tenant     | from the JWT; another city's zone answers `404`                                                                                                                                                                          | `api-contract.md` Transport                                  |
| Money      | `price` and `dailyTicketPrice` are JSON numbers in EUR, kept as numbers in the domain; formatted only at render                                                                                                          | spec: `DECIMAL(10,2)`                                        |
| Limits     | code and name 1–20 characters; prices ≥ 0 with at most 2 decimals; `durationMinutes` integer > 0; the other two integers ≥ 0                                                                                             | spec: ZONES columns and CHECKs                               |
| Form input | the form trims code and name and sends amounts as JSON numbers: it reads `0,70` and `0.70` alike, rejects a third decimal (`1,005`) instead of rounding, and caps amounts at 99 999 999,99 and integers at 2 147 483 647 | spec: `DECIMAL(10,2)`, `INT`                                 |
| Uniqueness | code and name each unique per city, compared case-insensitively (SQL Server default collation)                                                                                                                           | spec: `UQ_ZONES_Tenant_ZoneCode`, `UQ_ZONES_Tenant_ZoneName` |
| Update     | `PUT` replaces all fields; the list cache takes the returned zone without a refetch                                                                                                                                      | `api-contract.md` Writes                                     |
| Delete     | always allowed in the mock. `409 zoneInUse` for a zone with tickets is proposed but not built (D9); the client treats a `404` as already deleted and refreshes the list                                                  | `api-contract.md` ADM-2                                      |
| `price`    | what it covers (per hour or per `durationMinutes`) is open (D9); the API only stores it                                                                                                                                  | open question #11                                            |
