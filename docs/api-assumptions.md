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

### City settings (`src/features/city-settings/api/useCitySettings.ts`)

The shape is `api-contract.md` ADM-8: the CITY_TENANTS columns the city may
edit, in camelCase, plus `iban` and a read-only `reportEmail`, which are not
columns yet (D12). Mapping to the domain `CitySettings` (`name`, `oib`,
`street`, `houseNo`, `zipCode`, `city`, `iban`, `premisesCode`,
`cashRegisterCode`, `vatRate`) is in
`src/features/city-settings/validators/citySettings.ts`. The shell header reads
only `tenantName` from the same call (`src/features/shell/api/useCityName.ts`).

```json
{
  "tenantName": "Grad Samobor",
  "vatID": "12345678903",
  "address": "Trg kralja Tomislava",
  "houseNo": "5",
  "zipCode": "10430",
  "city": "Samobor",
  "iban": "HR1210010051863000160",
  "premisesCode": "SAMOBOR1",
  "cashRegisterCode": "1",
  "stopaPDV": 25,
  "reportEmail": "promet@samobor.hr"
}
```

| Call          | Body                          | Success      | Errors             |
| ------------- | ----------------------------- | ------------ | ------------------ |
| `GET /tenant` |                               | `200 Tenant` |                    |
| `PUT /tenant` | every field but `reportEmail` | `200 Tenant` | `400` field errors |

| Item          | Assumption                                                                                                                                                             | Source                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Path          | `/tenant`, no id: the city comes from the JWT's `TenantId` claim                                                                                                       | `api-contract.md` [proposed]                            |
| Address       | four fields (`address`, `houseNo`, `zipCode`, `city`) as the table has them, where the design shows one "Adresa" field                                                 | spec: CITY_TENANTS columns; `api-contract.md` D12       |
| Limits        | all required and trimmed: `tenantName` ≤ 100, `address` ≤ 150, `houseNo` ≤ 20, `zipCode` ≤ 10, `city` ≤ 100, `premisesCode` ≤ 25 characters; `vatID` exactly 11 digits | spec: CITY_TENANTS columns, all `NOT NULL`              |
| IBAN          | `HR` and 19 digits, sent without spaces and uppercased; no mod-97 check (open question #45)                                                                            | `api-contract.md` ADM-8; design help text               |
| Cash register | digits only, not starting with 0, up to 15                                                                                                                             | spec: `CK_CITY_TENANTS_CashRegisterCode`, `VARCHAR(15)` |
| VAT rate      | `stopaPDV` a number from 0 to 100 with at most two decimals; the form accepts a comma or a dot                                                                         | spec: `StopaPDV decimal(18,2)`, default 25              |
| Not exposed   | `tenantCode`, `countryCode`, `isActive`, `createdAt`, `updatedAt`: managed by Softlab                                                                                  | `api-contract.md` ADM-8                                 |
| Update        | `PUT` replaces every editable field; the cache takes the returned settings, and the header's city name is fetched again                                                | `api-contract.md` Writes                                |
| City name     | the shell reads it once per session; a failed call leaves the name out and the shell keeps working                                                                     | assumed                                                 |

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

### Privileged owners (`src/features/privileged-owners/api/usePrivilegedOwners.ts`)

The PRIVILEGED_OWNERS columns in camelCase, without `tenantId`, `createdAt` and
`updatedAt`. Mapping to the domain `PrivilegedOwner` (`id`, `plate`,
`validUntil` as a `Date`, `ownerName`, and `address` grouped as `street`,
`houseNo`, `zipCode`, `city`) is in
`src/features/privileged-owners/validators/privilegedOwner.ts`.

```json
{
  "privilegedOwnerId": 1,
  "vehicleRegistration": "ZG5553AI",
  "validUntil": "2027-06-30T21:59:59.999Z",
  "ownerName": "Marija Jurić",
  "address": "Livadićeva ulica",
  "houseNo": "3",
  "zipCode": "10430",
  "city": "Samobor"
}
```

| Call                                            | Body                              | Success                 | Errors                        |
| ----------------------------------------------- | --------------------------------- | ----------------------- | ----------------------------- |
| `GET /privileged-owners`                        |                                   | `200 PrivilegedOwner[]` |                               |
| `POST /privileged-owners`                       | entry without `privilegedOwnerId` | `201 PrivilegedOwner`   | `400` field errors            |
| `PUT /privileged-owners/{privilegedOwnerId}`    | entry without `privilegedOwnerId` | `200 PrivilegedOwner`   | same, plus `404`              |
| `DELETE /privileged-owners/{privilegedOwnerId}` |                                   | `204`                   | none; `404` counts as deleted |

| Item       | Assumption                                                                                                                                                                                                                                        | Source                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| List       | a plain array of the signed-in city's entries; tabs, counts, plate search and sort run in the browser, like Zones. Server paging (`api-contract.md` ADM-3) can come back if a city's list grows large                                             | user decision for #17                                  |
| Tenant     | from the JWT; another city's entry answers `404`                                                                                                                                                                                                  | `api-contract.md` Transport                            |
| ValidUntil | an instant in UTC. The form collects a day and sends the last millisecond of that day in Zagreb: `31.12.2026` is `2026-12-31T22:59:59.999Z`, `30.06.2027` is `2027-06-30T21:59:59.999Z`. Every save sends that, even when the date is unchanged   | spec: `DATETIME2(3)`, `ValidUntil >= SYSUTCDATETIME()` |
| Shown date | the date of `validUntil` in Zagreb (`dd.MM.yyyy`), so the end-of-day instant shows as the day that was entered                                                                                                                                    | assumed                                                |
| Valid      | `validUntil >= now`, compared as instants, the same rule as the Inspector check. The list computes it against the time it last loaded, so a row never changes status while it is being read                                                       | spec: Inspector check query                            |
| Plate      | sent normalised: no spaces or dashes, upper-cased, in the Croatian format: two letters, three or four digits, one or two letters (`ZG1234AB`), letters A–Z without Q, W, X and Y, plus Č, Ć, Đ, Š, Ž. The mock rejects anything else with a `400` | user; spec: `VARCHAR(20)`                              |
| Limits     | all columns required; `ownerName` ≤ 200, `address` ≤ 150, `houseNo` ≤ 20, `zipCode` ≤ 10, `city` ≤ 100 characters, trimmed                                                                                                                        | spec: PRIVILEGED_OWNERS columns, all `NOT NULL`        |
| Duplicates | a plate may appear more than once; the mock does not check (D10)                                                                                                                                                                                  | `api-contract.md` D10                                  |
| Update     | `PUT` replaces all fields; the list cache takes the returned entry without a refetch                                                                                                                                                              | `api-contract.md` Writes                               |
| Delete     | `DELETE /privileged-owners/{privilegedOwnerId}` answers `204`; the client treats a `404` as already deleted and refreshes the list. Whether the backend allows delete at all is D10                                                               | design; `api-contract.md` D10                          |

### Inspectors (`src/features/inspectors/api/useInspectors.ts`)

The shape is `api-contract.md` ADM-6: the INSPECTORS columns in camelCase,
without `tenantId`. The list leaves out `pin`; one inspector's detail carries
it. Mapping to the domain `Inspector` (`id`, `name`, `surname`, `oib`,
`isActive`, `ticketCount`) and `InspectorDetail` (plus `pin`) is in
`src/features/inspectors/validators/inspector.ts`.

```json
{
  "inspectorId": 1,
  "name": "Marko",
  "surname": "Horvat",
  "oib": "12345678901",
  "isActive": true,
  "ticketCount": 42
}
```

| Call                               | Body                                        | Success                           | Errors                                                            |
| ---------------------------------- | ------------------------------------------- | --------------------------------- | ----------------------------------------------------------------- |
| `GET /inspectors`                  |                                             | `200 Inspector[]`, no `pin`       |                                                                   |
| `GET /inspectors/{inspectorId}`    |                                             | `200 InspectorDetail`, with `pin` | `404`                                                             |
| `POST /inspectors`                 | inspector without `inspectorId`, with `pin` | `201 Inspector`                   | `400` field errors; `409 duplicate` on `oib`                      |
| `PUT /inspectors/{inspectorId}`    | inspector without `inspectorId`, with `pin` | `200 Inspector`                   | same, plus `404`                                                  |
| `DELETE /inspectors/{inspectorId}` |                                             | `204`                             | `409 inUse` when anything points at them; `404` counts as deleted |

| Item       | Assumption                                                                                                                                                                                                                                                                                                                                                                                | Source                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| List       | a plain array of the signed-in city's inspectors, sorted in the browser by surname, then name; no paging                                                                                                                                                                                                                                                                                  | `api-contract.md` Lists                                                         |
| Tenant     | from the JWT; another city's inspector answers `404`                                                                                                                                                                                                                                                                                                                                      | `api-contract.md` Transport                                                     |
| PIN        | readable by the admin: the edit form loads it from the detail and shows it masked, with a button to reveal it. The list never carries it, and every save sends it                                                                                                                                                                                                                         | user decision; `api-contract.md` D11                                            |
| PIN format | 1 to 4 digits, sent as a string so leading zeros survive (`0420`); the mock rejects anything else with a `400`                                                                                                                                                                                                                                                                            | spec: `Pin VARCHAR(4)`, `CK_INSPECTORS_Pin`                                     |
| Limits     | `name` and `surname` 1–100 characters, trimmed; `oib` exactly 11 digits, no checksum (open question #1)                                                                                                                                                                                                                                                                                   | spec: INSPECTORS columns                                                        |
| Uniqueness | `oib` unique per city: `409 { code: 'duplicate', field: 'oib' }`. Two inspectors may share a PIN, and the form does not warn; a `409` on `pin` would still show on the PIN field                                                                                                                                                                                                          | spec: `UQ_INSPECTORS_Tenant_Oib`; user decision                                 |
| Active     | `isActive` is sent on every save; a new inspector defaults to active in the form                                                                                                                                                                                                                                                                                                          | spec: `DF_INSPECTORS_IsActive DEFAULT (1)`                                      |
| Delete     | only an inspector with no tickets (user decision). The list carries `ticketCount`, the daily tickets they issued [proposed]; with tickets the delete is disabled and says to deactivate instead. The server still answers `409 inUse` when anything points at them (tickets or `PARKING_OBSERVATIONS`), and the dialog says so. A missing `ticketCount` leaves the decision to the server | user decision; spec: `TICKETS.InspectorId`, `FK_PARKING_OBSERVATIONS_INSPECTOR` |
| Update     | `PUT` replaces every field; the list cache takes the returned inspector without a refetch, and the detail is fetched again on the next edit                                                                                                                                                                                                                                               | `api-contract.md` Writes                                                        |

### Admin users (`src/features/admin-users/api/useAdminUsers.ts`)

The spec has no table for back-office users (open question #2, `api-contract.md`
D13), so the shape is `api-contract.md` ADM-9 as written: the login's user
fields without `tenantId`. Mapping to the domain `AdminUser` (`id`, `username`,
`name`, `surname`) is in `src/features/admin-users/validators/adminUser.ts`.

```json
{ "adminUserId": 2, "username": "marin.loncar", "name": "Marin", "surname": "Lončar" }
```

| Call                       | Body                                                     | Success           | Errors                                            |
| -------------------------- | -------------------------------------------------------- | ----------------- | ------------------------------------------------- |
| `GET /users`               |                                                          | `200 AdminUser[]` |                                                   |
| `POST /users`              | `username`, `name`, `surname`, `password`                | `201 AdminUser`   | `400` field errors; `409 duplicate` on `username` |
| `PUT /users/{adminUserId}` | `name`, `surname`, and `password` only when one is typed | `200 AdminUser`   | `400` field errors; `404`                         |

| Item           | Assumption                                                                                                                                                                                                                                                                     | Source                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| List           | a plain array of the signed-in city's users, sorted in the browser by username; no paging                                                                                                                                                                                      | `api-contract.md` Lists      |
| Tenant         | from the JWT; another city's user answers `404`, and their username is free in this city                                                                                                                                                                                       | assumed, as for inspectors   |
| Password       | write-only: sent on create and on an edit that types one, exactly as typed; never in a response. The response schemas have no `password`, so one sent by mistake is dropped, and the mutations are collected as soon as the form closes so the password leaves the query cache | `api-contract.md` ADM-9      |
| Password rules | none checked beyond "required on create" until they are defined (open question #49)                                                                                                                                                                                            | `api-contract.md` D13        |
| Username       | fixed after create: the `PUT` has no `username`, and the edit form shows it read-only (open question #50). Unique per city, compared exactly as typed after trimming                                                                                                           | `api-contract.md` ADM-9, D13 |
| Limits         | `username`, `name`, `surname` 1–100 characters, trimmed (as INSPECTORS names)                                                                                                                                                                                                  | assumed                      |
| "Vi"           | the row whose `adminUserId` equals the signed-in user's from login                                                                                                                                                                                                             | `api-contract.md` ADM-9      |
| Update         | the list cache takes the returned user without a refetch                                                                                                                                                                                                                       | `api-contract.md` Writes     |
| Delete         | not built yet (#85): `DELETE /users/{adminUserId}`, `409 cannotDeleteSelf`                                                                                                                                                                                                     | `api-contract.md` ADM-9      |

The mock's login still checks only the seed admin (`src/mocks/adminAccount.ts`),
so a user added on Korisnici cannot sign in to the mock.

### Tickets (`src/features/tickets/api/useTickets.ts`)

The shape is `api-contract.md` ADM-4. Mapping to the domain `Ticket` (`id`,
`type`, `createdAt`, `plate`, `zone { id, code }`, `parkingMinutes`, `amount`,
`validUntil`, `payment { status }`, `fiscal { status }`) and `TicketDetail`
(plus `transactionId`, `vat { base, rate, amount }` and `fiscal { jir, zki,
fiscalizedAt, lastError }`) is in `src/features/tickets/validators/ticket.ts`.

```json
{
  "ticketId": "6f1c2a1e-4b7f-4c3a-8e21-5f0a7b9c3d12",
  "ticketType": "Standard",
  "createdAt": "2026-10-06T07:14:00Z",
  "vehicleRegistration": "ZG1234AB",
  "zoneId": 1,
  "zoneCode": "ZONA1",
  "parkingMinutes": 60,
  "amount": 0.7,
  "validUntil": "2026-10-06T08:14:00Z",
  "paymentStatus": "DONE",
  "fiscalStatus": "DONE"
}
```

The detail adds `transactionId`, `osnovica`, `stopaPDV`, `iznosPDV`, `jir`,
`zki`, `fiscalizedAt` and `fiscalLastError`.

| Call                      | Query                                                                                                  | Success                    | Errors                |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------- | --------------------- |
| `GET /tickets`            | `page`, `pageSize`, `sortBy`, `sortDir`, `plate`, `createdFrom`, `createdTo`, `zoneId`, `fiscalStatus` | `200 Page<TicketListItem>` | `400` for a bad param |
| `GET /tickets/new-count`  | `createdAfter` (required), `plate`, `createdTo`, `zoneId`, `fiscalStatus`                              | `200 { "count": 3 }`       | `400` for a bad param |
| `GET /tickets/{ticketId}` |                                                                                                        | `200 TicketDetail`         | `404`                 |

| Item            | Assumption                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Source                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Paging          | `Page<T>` (`items`, `page`, `pageSize`, `totalCount`); `page` 1-based, `pageSize` 1–100 (the screen asks for 25, a user decision). A page past the end answers `200` with no items and the real `totalCount`; the screen then offers the first page                                                                                                                                                                                                                                                                                                                                                                     | `api-contract.md` Lists                                          |
| Sort            | `sortBy` is `createdAt` (default, `desc`), `vehicleRegistration`, `amount` or `validUntil`; ties go by `transactionId`. The screen keeps `sort` and `dir` in its URL and goes back to page 1 on a new order                                                                                                                                                                                                                                                                                                                                                                                                             | `api-contract.md` ADM-4                                          |
| Filters         | `plate` matches anywhere, any case; `createdFrom` inclusive and `createdTo` exclusive, both UTC instants; `fiscalStatus` one spec value. The screen keeps the filters in its URL as days (`plate`, `from`, `to` as `YYYY-MM-DD`, `zone`, `fiscal`) and sends a day range as Zagreb midnight of `from` up to Zagreb midnight after `to`. Every change goes back to page 1                                                                                                                                                                                                                                                | `api-contract.md` Names and types                                |
| New count       | tickets with `createdAt > createdAfter` that match the other filters, polled every 30 s (the contract's "about every 30 seconds") and not while the tab is hidden. `createdAfter` is the newest matching ticket when the rows were loaded, read as `GET /tickets?page=1&pageSize=1&sortBy=createdAt&sortDir=desc` with the filters; when none match, just before `createdFrom` (or the epoch), because the count takes no `createdFrom`, so the count is right on any page and sort. The rows and that time never go stale on their own; "Prikaži nove karte" reloads both and opens page 1, newest first, filters kept | `api-contract.md` ADM-4                                          |
| Status values   | `PENDING`, `PROCESSING`, `DONE`, `FAIL` for both stages; anything else fails the response (`invalidResponse`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | spec: `CK_TICKETS_*Status`; feature docs §5.1                    |
| Payment name    | `paymentStatus`, or `vivaStatus` when that is the only one sent; `paymentStatus` wins when both arrive                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | feature docs §5.4; `api-contract.md` D6                          |
| Ticket type     | `ticketType` `Standard` or `Dnevna`, `Standard` when missing (the table's default). The list holds `Standard` only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | spec: `DF_TICKETS_TicketTypeId DEFAULT (1)`; D5                  |
| Date-times      | ISO 8601; one without an offset (`2026-10-06T07:14:00`, as `DATETIME2` serialises) is read as UTC, never as local time                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | spec: `SYSUTCDATETIME()` defaults                                |
| `validUntil`    | a computed column (`CreatedAt + ParkingMinutes`); when it is missing or `null` the client computes it the same way                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | spec: `ValidUntil AS DATEADD(MINUTE, ParkingMinutes, CreatedAt)` |
| Money and VAT   | `amount`, `osnovica` and `iznosPDV` are EUR numbers at full precision (`DECIMAL(18,6)`), `stopaPDV` a percent (`25`); rounded to cents only when shown, in the detail's "Podaci o karti" (user decision). Not in the contract yet, so each may be missing or `null` and then shows a dash                                                                                                                                                                                                                                                                                                                               | spec: TICKETS columns                                            |
| `transactionId` | a number or a string, shown as it comes (`100300`, `20261006-000412`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | feature docs §5.5                                                |
| Fiscal fields   | `jir`, `zki`, `fiscalizedAt`, `fiscalLastError` may be `null` or missing; the screen shows a dash. `fiscalLastError` is the only server text shown, as "Odgovor sustava"; the payment error is deliberately not shown (user decision)                                                                                                                                                                                                                                                                                                                                                                                   | `api-contract.md` Errors                                         |
| Zone filter     | the options are `GET /zones` (code and id only), read by `useZoneOptions` in `src/shared/lib/`, which Karte and DPK share with the rest of the filter bar. A `zone` in the URL that is not a city zone shows its id in the filter tag                                                                                                                                                                                                                                                                                                                                                                                   | `api-contract.md` ADM-2                                          |
| Not in the API  | phone number, `PaymentLastError`, invoice and premises codes, `Central*` columns: no screen shows them                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `api-contract.md` ADM-4                                          |
| Tenant          | from the JWT; another city's ticket answers `404`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `api-contract.md` Transport                                      |
| Mock            | 300 tickets for the city, seeded deterministically: the design's eight rows (06.10.2026 08:40–09:14) and older ones with mixed statuses. Fiscalization stays `PENDING` until the payment is `DONE`                                                                                                                                                                                                                                                                                                                                                                                                                      | `src/mocks/tickets.ts`                                           |

### Daily tickets (`src/features/daily-tickets/api/useDailyTickets.ts`)

The shape is `api-contract.md` ADM-5. Mapping to the domain `DailyTicket` (`id`,
`createdAt`, `plate`, `zone { id, code }`, `address`, `inspector { id, name }`,
`amount`, `fiscal { status }`) and `DailyTicketDetail` (plus `fiscal { jir, zki,
fiscalizedAt, lastError }` and `photos { id, url }[]`) is in
`src/features/daily-tickets/validators/dailyTicket.ts`.

```json
{
  "ticketId": "0b8f5d2e-7c41-4a9e-9d3a-2f6e1c8b4a70",
  "createdAt": "2026-10-06T06:48:00Z",
  "vehicleRegistration": "ZG9087KL",
  "zoneId": 2,
  "zoneCode": "2A",
  "address": "Perkovčeva ulica 12",
  "inspectorId": 1,
  "inspectorName": "Marko",
  "inspectorSurname": "Horvat",
  "amount": 15,
  "fiscalStatus": "FAIL"
}
```

The detail adds `jir`, `zki`, `fiscalizedAt`, `fiscalLastError` and
`photos: [{ "photoId": "…", "url": "…" }]`.

| Call                                       | Query                                                                                                  | Success                         | Errors                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------- | ---------------------------------------------------------------------- |
| `GET /daily-tickets`                       | `page`, `pageSize`, `sortBy`, `sortDir`, `plate`, `createdFrom`, `createdTo`, `zoneId`, `fiscalStatus` | `200 Page<DailyTicketListItem>` | `400` for a bad param                                                  |
| `GET /daily-tickets/{ticketId}`            |                                                                                                        | `200 DailyTicketDetail`         | `404`                                                                  |
| `POST /daily-tickets/{ticketId}/fiscalize` | no body                                                                                                | `200 DailyTicketDetail`         | `404`; `409 alreadyFiscalized` (`DONE`), `409 fiscalizationInProgress` |

| Item              | Assumption                                                                                                                                                                                                                                                                                                   | Source                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Paging and filter | as Karte: `Page<T>`, 25 per page, the same filter params and URL keys (`plate`, `from`, `to`, `zone`, `fiscal`), a day range sent as Zagreb midnights, every change back to page 1. No new-ticket count: DPK rows are not live                                                                               | `api-contract.md` ADM-5                      |
| Sort              | `sortBy` is `createdAt` (default, `desc`), `vehicleRegistration` or `inspector` (surname, then name); `Iznos` is not sortable, every DPK in a zone costs the same                                                                                                                                            | `api-contract.md` ADM-5                      |
| Inspector         | `inspectorName` and `inspectorSurname` arrive apart and show as one name, "Marko Horvat"                                                                                                                                                                                                                     | `api-contract.md` ADM-5; spec: INSPECTORS    |
| `address`         | where the inspector found the vehicle; may be `null` or missing and then shows a dash. Not a TICKETS column in the spec                                                                                                                                                                                      | `api-contract.md` ADM-5; feature docs §5.8   |
| Money             | `amount` is EUR at full precision, rounded only when shown                                                                                                                                                                                                                                                   | spec: `DECIMAL(18,6)`                        |
| Fiscal fields     | as Karte. A `null` JIR shows "Nije dodijeljen" (the design's words); `fiscalLastError` shows as "Odgovor sustava" in the failure notice at the top of the detail                                                                                                                                             | design `04-dpk-detalji`                      |
| Photos            | `photos` may be missing (none). Each `url` goes straight into an `<img>`, so it must work without the API key or JWT: a short-lived signed link (D7). A link that fails to load shows "Fotografija nije dostupna" in place of that photo. Shown at 4:3, lazy-loaded                                          | `api-contract.md` D7; feature docs §5.8–5.10 |
| Fiscalize again   | offered only on a `FAIL` ticket. The answer's ticket replaces the detail and its row on every loaded list page, without a refetch. `DONE` and `FAIL` show a toast with the result; `PENDING` or `PROCESSING` (a queued call, D8) shows "u obradi" and is not polled. A `409` reloads the detail and the list | `api-contract.md` ADM-5, D8                  |
| Not in the API    | ticket number, vehicle brand and first observation time: the design does not show them (open question 39)                                                                                                                                                                                                    | `api-contract.md` ADM-5                      |
| Tenant            | from the JWT; another city's DPK answers `404`                                                                                                                                                                                                                                                               | `api-contract.md` Transport                  |
| Mock              | 60 DPKs for the city, seeded deterministically: the design's eight rows (05.10.2026 13:47 to 06.10.2026 09:05) and older ones. Photos are inline SVGs. ZG6140TR fails again when retried, KA4410CD has no photos, ST8032PV has one broken photo                                                              | `src/mocks/dailyTickets.ts`                  |
