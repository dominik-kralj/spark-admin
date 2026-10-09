# SPARK Admin: frontend / backend API contract

Proposal v0.1, 2026-10-07. Written by the frontend, for the backend team to
confirm or correct.

The spec defines no Admin endpoints, so almost everything here is a proposal.
It is built from three sources: the spec's tables and Inspector endpoints, the
Admin design (which fixes what each screen shows), and what the frontend has
already implemented.

How this relates to `api-assumptions.md`: that file records what the frontend
code assumes today (transport, errors, login). This file is the full target
contract for all features. Where both cover the same thing they agree.

Markers used below:

- **[spec]** taken from the spec.
- **[built]** already implemented in the frontend against the mock.
- **[proposed]** our suggestion; change it if the backend prefers otherwise.
- **D1, D2, …** a decision the backend team has to make, listed in section 4.

## 1. Conventions

### Transport

| Item      | Contract                                                                                     |            |
| --------- | -------------------------------------------------------------------------------------------- | ---------- |
| Base URL  | `https://{host}/api/v1/admin`. Every path below is relative to it. See D1.                   | [built]    |
| API key   | `X-API-KEY: <key>` on every request, including login. See D4.                                | [spec]     |
| Auth      | `Authorization: Bearer <JWT>` on every request except `POST /login`.                         | [spec]     |
| Bodies    | JSON both ways. `Accept: application/json` always; `Content-Type` only when there is a body. | [built]    |
| Tenant    | The city comes from the JWT (`TenantId` claim). It is never in a URL or a request body.      | [proposed] |
| Other IDs | An ID that belongs to another city answers `404`, the same as an ID that does not exist.     | [proposed] |

### Names and types

- Property names are the spec's column and model names in camelCase
  (`vehicleRegistration`, `zoneCode`, `stopaPDV`, `jir`), so backend models
  serialise without renaming. [built]
- Numeric IDs are JSON numbers. `ticketId` is a GUID string. [spec]
- Date-times are ISO 8601 in UTC with `Z` (`2026-10-06T07:14:00Z`). The
  frontend converts to and from Europe/Zagreb local time. [built]
- Date-range filters are instants: `…From` is inclusive, `…To` is exclusive.
  For "06.10.2026 to 06.10.2026" the frontend sends
  `createdFrom=2026-10-05T22:00:00Z&createdTo=2026-10-06T22:00:00Z`. [proposed]
- Money is a JSON number in EUR. Requests carry at most 2 decimals. [proposed]
- Plates are Croatian plates without spaces or dashes (`ZG1234AB`): two letters,
  three or four digits, then one or two letters; the letters are A–Z without
  Q, W, X and Y, plus Č, Ć, Đ, Š, Ž. [built] The frontend sends them normalised; the backend should
  normalise again before storing or comparing. [spec]
- Status values (payment and fiscalization) are the type `Status` used below:
  `'PENDING' | 'PROCESSING' | 'DONE' | 'FAIL'`. [spec]

### Lists

Small master-data lists (zones, privileged owners, inspectors, admin users) return a plain array
and are sorted in the browser. Large lists are paged on the server:

```ts
// Query: page (1-based, default 1), pageSize (default 25, max 100),
//        sortBy (allowed values per endpoint), sortDir ('asc' | 'desc')
interface Page<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}
```

### Writes

- `POST` answers `201` with the created object.
- `PUT` replaces all editable fields and answers `200` with the updated object.
- `DELETE` answers `204` with no body.
- There is no optimistic locking: the last save wins. [proposed]

### Errors

The frontend maps the status code to an error kind and shows its own Croatian
message. It never shows server text, with one exception: `fiscalLastError`. [built]

| Status   | Meaning for the frontend                                  |
| -------- | --------------------------------------------------------- |
| 400, 422 | Validation failed                                         |
| 401      | Wrong login; or, on a signed-in call, the session is over |
| 403      | Not allowed                                               |
| 404      | Not found                                                 |
| 409      | Conflict: duplicate, in use, or wrong state               |
| 429      | Rate limited (login: 5 per IP per minute) [spec]          |
| 5xx      | Server error                                              |

To mark the right form field, two error bodies need a fixed shape (D2):

```jsonc
// 400: ASP.NET Core ValidationProblemDetails. Keys are request property names.
{ "status": 400, "errors": { "oib": ["invalid"], "pin": ["tooLong"] } }

// 409: ProblemDetails plus a machine-readable code and, for duplicates, the field.
{ "status": 409, "code": "duplicate", "field": "zoneCode" }
```

`409` codes used in this contract: `duplicate`, `zoneInUse`,
`alreadyFiscalized`, `fiscalizationInProgress`, `cannotDeleteSelf`,
`noReportEmail`.

## 2. Features and their calls

| Feature                 | Screen               | Calls                                                                                             |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------------------------- |
| ADM-1 Login             | Prijava              | `POST /login`                                                                                     |
| App shell               | every screen         | `GET /tenant` (city name in the header)                                                           |
| ADM-4 Tickets           | Karte                | `GET /tickets`, `GET /tickets/new-count`, `GET /tickets/{ticketId}`, `GET /zones`                 |
| ADM-5 DPK               | DPK                  | `GET /daily-tickets`, `GET /daily-tickets/{ticketId}`, `POST /daily-tickets/{ticketId}/fiscalize` |
| ADM-2 Zones             | Zone                 | `GET /zones`, `POST /zones`, `PUT /zones/{zoneId}`, `DELETE /zones/{zoneId}`                      |
| ADM-3 Privileged owners | Povlašteni korisnici | `GET /privileged-owners`, `POST /privileged-owners`, `PUT` and `DELETE /privileged-owners/{id}`   |
| ADM-6 Inspectors        | Kontrolori           | `GET /inspectors`, `POST /inspectors`, `PUT /inspectors/{inspectorId}`                            |
| ADM-7 Reports           | Izvještaji           | `GET /reports`, `GET /reports/{reportKey}/preview`, `GET …/pdf`, `POST …/email`                   |
| ADM-8 City settings     | Postavke grada       | `GET /tenant`, `PUT /tenant`                                                                      |
| ADM-9 Admin users       | Korisnici            | `GET /users`, `POST /users`, `PUT /users/{adminUserId}`, `DELETE /users/{adminUserId}`            |

## 3. Endpoints

### ADM-1 Login [built]

`POST /login`, no `Authorization` header.

```ts
// Request
interface LoginRequest {
  username: string // trimmed
  password: string // exactly as typed
}

// 200
interface LoginResponse {
  token: string // JWT
  expiresAt?: string // [proposed] so the UI can warn before the session ends (D3)
  user: {
    adminUserId: number
    tenantId: number
    username: string
    name: string
    surname: string
  }
}
```

- `401` with no body for a wrong username or password. The UI does not say which.
- `429` after 5 requests per IP per minute.
- Logout calls nothing; the frontend drops the token.
- Any signed-in call that answers `401` ends the session and returns to login.

### ADM-4 Tickets (Karte)

Paid parking tickets bought over WhatsApp: ticket type `Standard` only. See D5
for which tickets the list contains.

`GET /tickets`

| Query          | Type   | Notes                                                                        |
| -------------- | ------ | ---------------------------------------------------------------------------- |
| `plate`        | string | Matches anywhere in the plate                                                |
| `createdFrom`  | string | Instant, inclusive                                                           |
| `createdTo`    | string | Instant, exclusive                                                           |
| `zoneId`       | number |                                                                              |
| `fiscalStatus` | string | One status value                                                             |
| `sortBy`       | string | `createdAt` (default, `desc`), `vehicleRegistration`, `amount`, `validUntil` |
| paging         |        | `page`, `pageSize`, `sortDir`                                                |

```ts
// 200: Page<TicketListItem>
interface TicketListItem {
  ticketId: string
  createdAt: string // "Vrijeme"
  vehicleRegistration: string
  zoneId: number
  zoneCode: string // shown in the Zona column
  parkingMinutes: number
  amount: number
  validUntil: string
  paymentStatus: Status // D6
  fiscalStatus: Status
}
```

`GET /tickets/new-count`

Feeds the "3 nove karte od zadnjeg učitavanja" banner, so rows never move
while someone reads the table. The frontend calls it about every 30 seconds
while Karte is open.

- Query: `createdAfter` (the `createdAt` of the newest loaded ticket) plus the
  same `plate`, `createdTo`, `zoneId` and `fiscalStatus` filters as the list.
- `200`: `{ "count": 3 }`

`GET /tickets/{ticketId}`

```ts
// 200
interface TicketDetail extends TicketListItem {
  transactionId: number // "Broj transakcije"
  jir: string | null
  zki: string | null
  fiscalizedAt: string | null
  fiscalLastError: string | null
  osnovica: number | null // [proposed] VAT base, DECIMAL(18,6)
  stopaPDV: number | null // [proposed] VAT rate in percent, e.g. 25
  iznosPDV: number | null // [proposed] VAT amount, DECIMAL(18,6)
}
```

The VAT fields are the TICKETS columns of the same names; the detail shows a
dash while they are missing. [proposed]

The driver's phone number is deliberately not in the contract: no screen
shows it, and it is personal data.

### ADM-5 Daily tickets (DPK)

Daily parking tickets issued by inspectors: ticket type `Dnevna`.

`GET /daily-tickets`

Query: `plate`, `createdFrom`, `createdTo`, `zoneId`, `fiscalStatus` as for
tickets. `sortBy`: `createdAt` (default, `desc`), `vehicleRegistration`,
`inspector` (by surname, then name). Paging as usual.

```ts
// 200: Page<DailyTicketListItem>
interface DailyTicketListItem {
  ticketId: string
  createdAt: string // "Vrijeme izdavanja"
  vehicleRegistration: string
  zoneId: number
  zoneCode: string
  address: string | null
  inspectorId: number
  inspectorName: string
  inspectorSurname: string
  amount: number
  fiscalStatus: Status
}
```

`GET /daily-tickets/{ticketId}`

```ts
// 200
interface DailyTicketDetail extends DailyTicketListItem {
  jir: string | null
  zki: string | null
  fiscalizedAt: string | null
  fiscalLastError: string | null // shown to the user as "Odgovor sustava"
  photos: { photoId: string; url: string }[] // D7
}
```

The Inspector app also collects a ticket number, vehicle brand and first
observation time. The Admin design does not show them, so they are not in the
contract; adding them later is harmless.

`POST /daily-tickets/{ticketId}/fiscalize` ("Fiskaliziraj ponovno")

- No body. Allowed only when `fiscalStatus` is `FAIL`.
- `200` with the `DailyTicketDetail`, carrying the new `fiscalStatus`. If the
  backend only queues the work, that status is `PROCESSING` and the frontend
  re-reads the detail every few seconds until it changes (D8).
- `409` `alreadyFiscalized` when it is `DONE`; `409` `fiscalizationInProgress`
  when it is `PENDING` or `PROCESSING`.

Issuing a DPK from Admin is mentioned in the spec but not described, and the
design has no screen for it. It is not in this contract.

### ADM-2 Zones (Zone)

```ts
interface Zone {
  zoneId: number
  zoneCode: string // 1 to 20 characters, unique in the city
  zoneName: string // 1 to 20 characters, unique in the city
  price: number // >= 0 (D9: per what?)
  dailyTicketPrice: number // >= 0, the DPK price
  durationMinutes: number // integer > 0
  maxExtensions: number // integer >= 0, default 3
  dpkIssueDelayMinutes: number // integer >= 0, default 15
}
type ZoneInput = Omit<Zone, 'zoneId'>
```

| Call                     | Body        | Success      | Conflicts                                            |
| ------------------------ | ----------- | ------------ | ---------------------------------------------------- |
| `GET /zones`             |             | `200 Zone[]` |                                                      |
| `POST /zones`            | `ZoneInput` | `201 Zone`   | `409 duplicate`, `field`: `zoneCode` or `zoneName`   |
| `PUT /zones/{zoneId}`    | `ZoneInput` | `200 Zone`   | same                                                 |
| `DELETE /zones/{zoneId}` |             | `204`        | `409 zoneInUse` when tickets reference the zone (D9) |

`GET /zones` also fills the zone filter on Karte, DPK and Izvještaji.

### ADM-3 Privileged owners (Povlašteni korisnici)

```ts
interface PrivilegedOwner {
  privilegedOwnerId: number
  vehicleRegistration: string
  validUntil: string // instant; "valid" means validUntil >= now [spec]
  ownerName: string // up to 200
  address: string // up to 150
  houseNo: string // up to 20
  zipCode: string // up to 10
  city: string // up to 100
}
type PrivilegedOwnerInput = Omit<PrivilegedOwner, 'privilegedOwnerId'>
```

All fields are required [spec: every column is NOT NULL].

`GET /privileged-owners` answers `200 PrivilegedOwner[]`: every entry of the city, as
for zones. The tabs ("Svi (6) / Važeći (4) / Istekli (2)"), their counts, the
plate search and the sort run in the browser. [built] Server paging with
`plate`, `validity` and `sortBy` and the counts in the response can be added if a
city's list grows into the thousands.

| Call                                            | Body                   | Success               |
| ----------------------------------------------- | ---------------------- | --------------------- |
| `POST /privileged-owners`                       | `PrivilegedOwnerInput` | `201 PrivilegedOwner` |
| `PUT /privileged-owners/{privilegedOwnerId}`    | `PrivilegedOwnerInput` | `200 PrivilegedOwner` |
| `DELETE /privileged-owners/{privilegedOwnerId}` |                        | `204` (D10)           |

The form collects a date only. The frontend sends the end of that day in
Zagreb time: `31.12.2026` becomes `2026-12-31T22:59:59.999Z`.

### ADM-6 Inspectors (Kontrolori)

```ts
interface Inspector {
  inspectorId: number
  name: string // up to 100
  surname: string // up to 100
  oib: string // exactly 11 digits, unique in the city
  isActive: boolean
  ticketCount: number // [proposed] daily tickets this inspector issued (TICKETS.InspectorId)
}
// The admin sees the PIN in the edit form; the list never carries it (D11).
interface InspectorDetail extends Inspector {
  pin: string // 1 to 4 digits
}
type InspectorInput = Omit<InspectorDetail, 'inspectorId'>
```

| Call                               | Body             | Success               | Conflicts                       |
| ---------------------------------- | ---------------- | --------------------- | ------------------------------- |
| `GET /inspectors`                  |                  | `200 Inspector[]`     |                                 |
| `GET /inspectors/{inspectorId}`    |                  | `200 InspectorDetail` |                                 |
| `POST /inspectors`                 | `InspectorInput` | `201 Inspector`       | `409 duplicate`, `field`: `oib` |
| `PUT /inspectors/{inspectorId}`    | `InspectorInput` | `200 Inspector`       | same                            |
| `DELETE /inspectors/{inspectorId}` |                  | `204`                 | `409 inUse`                     |

An inspector who issued tickets is switched off with `isActive: false`, not
deleted, because tickets keep pointing at them. Only one with nothing pointing
at them (no tickets, no `PARKING_OBSERVATIONS`) can be deleted; otherwise the
server answers `409 { "code": "inUse" }`. [proposed]

### ADM-7 Reports (Izvještaji), provisional

The report list, columns and parameters are not defined anywhere (D14). This
shape lets the screen work with any set of reports the backend offers.

```ts
// GET /reports -> 200 ReportDefinition[]
interface ReportDefinition {
  reportKey: string
  name: string // shown in the "Izvještaj" select
}

// Parameters for the three calls below
interface ReportParams {
  dateFrom: string // instant, inclusive
  dateTo: string // instant, exclusive
  zoneId?: number // left out = all zones
}

// GET /reports/{reportKey}/preview?dateFrom=…&dateTo=…&zoneId=… -> 200
interface ReportPreview {
  columns: { key: string; label: string; align: 'left' | 'right' }[]
  rows: Record<string, string | number>[]
  totals: Record<string, string | number> | null // the "Ukupno" row
}
```

- `GET /reports/{reportKey}/pdf` with the same query answers `200`
  `application/pdf` with a `Content-Disposition` file name. The frontend
  downloads it.
- `POST /reports/{reportKey}/email` with `ReportParams` as the body answers
  `202`. The report goes to the city's preset address (`reportEmail` in
  `GET /tenant`). `409 noReportEmail` when none is set.

### ADM-8 City settings (Postavke grada)

```ts
interface Tenant {
  tenantName: string // up to 100; also shown in the app header
  vatID: string // OIB, exactly 11 digits
  address: string // up to 150
  houseNo: string // up to 20
  zipCode: string // up to 10
  city: string // up to 100
  iban: string // "HR" + 19 digits, no spaces (D12)
  premisesCode: string // up to 25
  cashRegisterCode: string // digits only, not starting with 0, up to 15 [spec]
  stopaPDV: number // percent, 0 to 100, default 25
  reportEmail: string | null // read-only here (D12)
}
type TenantInput = Omit<Tenant, 'reportEmail'>
```

| Call          | Body          | Success      |
| ------------- | ------------- | ------------ |
| `GET /tenant` |               | `200 Tenant` |
| `PUT /tenant` | `TenantInput` | `200 Tenant` |

`tenantCode`, `countryCode` and `isActive` are not exposed; we assume Softlab
manages them.

### ADM-9 Admin users (Korisnici)

There is no table for back-office users in the spec (D13).

```ts
interface AdminUser {
  adminUserId: number
  username: string // unique
  name: string
  surname: string
}
interface AdminUserCreate {
  username: string
  name: string
  surname: string
  password: string
}
interface AdminUserUpdate {
  name: string
  surname: string
  password?: string // left out = keep the current password
}
```

| Call                          | Body              | Success           | Conflicts                            |
| ----------------------------- | ----------------- | ----------------- | ------------------------------------ |
| `GET /users`                  |                   | `200 AdminUser[]` |                                      |
| `POST /users`                 | `AdminUserCreate` | `201 AdminUser`   | `409 duplicate`, `field`: `username` |
| `PUT /users/{adminUserId}`    | `AdminUserUpdate` | `200 AdminUser`   |                                      |
| `DELETE /users/{adminUserId}` |                   | `204`             | `409 cannotDeleteSelf`               |

Passwords are never returned. The frontend marks the signed-in user's own row
("Vi") by comparing `adminUserId` with the one from login.

## 4. Decisions needed from the backend team

| #   | Decision                                                                                                                                                                                                                                               | Affects      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| D1  | Base path. The spec routes by controller name (`api/v1/[controller]`) and names an Admin `InspectorController`, which would collide with the Inspector app's own `api/v1/inspector`. We put everything under `/api/v1/admin/…`. Confirm or give paths. | all          |
| D2  | Error bodies: confirm the `400` field map and the `409` `code` + `field` shape, with keys in camelCase.                                                                                                                                                | all forms    |
| D3  | Login: is the city decided by the user account, or does the request need a `tenantId` like the Inspector login? Can the response carry `expiresAt`?                                                                                                    | ADM-1        |
| D4  | `X-API-KEY` in a browser app is visible to every user, so it cannot work as a secret or a licence check there. Keep it as an identifier only, or drop it for Admin?                                                                                    | all          |
| D5  | Which tickets does `GET /tickets` return? Only finished ones in `spark_central`, or also ones still being processed or failed in `spark_work`? The design shows payment "U obradi" and "Neuspjelo" rows, which needs the second.                       | ADM-4        |
| D6  | Status field names: the table says `PaymentStatus`, the constraints and samples say `VivaStatus`. The contract uses `paymentStatus`.                                                                                                                   | ADM-4, ADM-5 |
| D7  | DPK photos: an `<img>` cannot send the API key or JWT. Proposal: `url` is a short-lived signed link. Where photos are stored is not in the spec at all.                                                                                                | ADM-5        |
| D8  | "Fiscalize again": does the call wait for the result, or queue it and return `PROCESSING`?                                                                                                                                                             | ADM-5        |
| D9  | Zones: what does `price` cover (the spec says "per hour" in one place, the table pairs it with `DurationMinutes`)? Can a zone with tickets be deleted, or is `409 zoneInUse` right?                                                                    | ADM-2        |
| D10 | Privileged owners: is delete allowed (the spec lists only view, add, edit; the design has delete)? May one plate have two entries? Is a privilege tied to a zone (the Inspector check returns a zone for it, the table has none)?                      | ADM-3        |
| D11 | Inspector PIN: the edit form shows it (user decision), so `GET /inspectors/{id}` returns it; the list does not. PINs need not be unique; how does Inspector login tell two inspectors with one PIN apart?                                              | ADM-6        |
| D12 | City settings: `CITY_TENANTS` has no IBAN column and no report e-mail. The design has one "Adresa" field; the table has four address columns, which the contract follows. Which fields may the city edit itself?                                       | ADM-7, ADM-8 |
| D13 | Admin users: table and fields, password rules (the form has to state them), whether a username can change, delete or deactivate.                                                                                                                       | ADM-1, ADM-9 |
| D14 | Reports: the list of reports, their columns and parameters, and whether the preview is data (as proposed) or the PDF itself.                                                                                                                           | ADM-7        |

## 5. What the backend schema is missing for this contract

- A table for back-office users (ADM-1, ADM-9).
- `CITY_TENANTS`: IBAN and the preset report e-mail address (ADM-7, ADM-8).
- Storage for DPK vehicle photos and a way to serve them (ADM-5).

Already there and relied on: `FiscalLastError` on `TICKETS`, shown on the DPK
detail when fiscalization fails.
