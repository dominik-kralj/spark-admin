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
(`application/problem+json`), but the frontend **reads only the status code**.
A missing, plain-text or HTML error body is handled the same way. Messages
shown to the user come from `hr.ts`, by error kind, and never from the server.

| Status             | `ApiError.kind`   | Notes                                                                                    |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------- |
| 400, 422           | `validation`      | field-level errors not read yet (open question)                                          |
| 401                | `unauthorized`    | missing/invalid API key or JWT; wrong login. With a token sent, it also ends the session |
| 403                | `forbidden`       |                                                                                          |
| 404                | `notFound`        |                                                                                          |
| 409                | `conflict`        | e.g. duplicate, or a stale edit                                                          |
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
