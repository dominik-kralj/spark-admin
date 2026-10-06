# SPARK — Feature Documentation

Short, feature-by-feature summary of the spec *Sustav za naplatu parkiranja SPARK* (v1.0.1, 08.09.2026). The full spec stays the source for code samples, SQL scripts and screen mockups.

## Overview

SPARK (Samobor parking) is one platform for city parking: drivers pay over WhatsApp, inspectors check vehicles in an Android app, and the city manages everything in a web admin. All three run on one shared backend and database.

| Component | Used by | Purpose | Tech |
|---|---|---|---|
| **SPARK WhatsApp Parking** | Drivers (local and foreign) | Register and pay for parking | WhatsApp Business API + chatbot |
| **SPARK Inspector** | Parking inspectors (kontrolori) | Check vehicles, issue daily tickets | Native Android, Kotlin |
| **SPARK Admin** | City / parking operator | Configuration, oversight, reporting | React, responsive (desktop + tablet) |
| **Backend** | All of the above | Web API, payments, fiscalization | C# .NET 8+ Web API, Dapper (async), MS SQL Server 2022 Express |

**Third-party integrations:** WhatsApp Business API, Viva.com (card payments, tokenization, refunds), CIS (Porezna uprava fiscalization), MUP (vehicle owner lookup).

**Why it exists:** no SMS operator fee (driver pays the ticket price 1:1), foreign cards accepted, no app to install, no setup cost for the city, extension with a single reply.

### Glossary

| Term | Meaning |
|---|---|
| **DPK** (dnevna parkirna karta) | Daily parking ticket issued by an inspector to a vehicle without valid parking. Ticket type `Dnevna`. |
| **Tenant** | A city / operator using SPARK (`CITY_TENANTS`). |
| **Povlašteno parkiranje** | Privileged parking: plates that do not pay (residents and similar). |
| **Fiskalizacija, JIR, ZKI** | Croatian fiscal receipt registration and its two identifiers. |
| **Prvo opažanje** | First observation: the first time an inspector checks an unpaid vehicle. |

---

## 1. WhatsApp Parking (drivers)

### WA-1 First parking (onboarding)
- Driver scans the QR code on the parking sign (opens the SPARK WhatsApp chat) or messages the SPARK number directly.
- Driver sends `<zone code> <plate>`, for example `708001 ZG5553AI`.
- No saved card for that phone number: the bot replies with a one-time link to the Viva.com payment page.
- Driver enters the card and passes 3D Secure. Viva returns a token, which SPARK stores for that phone number.
- SPARK charges the first parking, fiscalizes it and sends the confirmation (WA-4).

### WA-2 Repeat parking (one message)
- Driver sends `<zone code> <plate>` to the same number.
- SPARK finds the stored token and charges it in the background (off-session). No link, no card entry.
- Confirmation follows as in WA-4.

### WA-3 Expiry reminder and extension
- 15 minutes before a ticket expires, the bot sends a reminder with plate, zone, expiry time and transaction number.
- Driver replies `DA`. SPARK charges the stored token and creates a new ticket that starts when the current one ends, for the zone's standard duration.
- Reminders are only sent while the ticket is under the zone's extension limit (`MaxExtensions`, default 3).

### WA-4 Confirmation message
- Sent once, after the parking is successfully processed. Contains plate, city and zone, valid-until time, amount and transaction number.
- No intermediate "processing" messages, because each WhatsApp message costs money.
- The backend scope also lists a WhatsApp notification when a DPK is issued; the spec does not describe it further.

---

## 2. SPARK Inspector (Android)

The app has two jobs: check whether parking is paid, and issue/print a DPK. Everything is online, through the Web API.

### INS-1 PIN login
- Splash screen (about 1 s), then login.
- PIN is digits only, up to 4 characters, masked; a button reveals it only while held.
- Calls `Login` with `TenantId` + PIN. The inspector must exist in `INSPECTORS` and be active.
- On failure: "Pogrešno upisan PIN ili korisnik nije aktivan. Molim pokušajte ponovo." and the PIN field is cleared.
- On success the API returns a JWT (valid 10 hours) and the app opens the main screen.

### INS-2 Main screen
- Shows the operator's company name (prominent) and the logged-in inspector's name.
- Actions: **Očitaj tablicu (ANPR)**, **Upiši registarsku oznaku vozila**, **Izgovori registarsku oznaku vozila**, **Odjava**.

### INS-3 Plate entry, three ways
| Method | How it works |
|---|---|
| **ANPR (camera)** | Back camera with a target frame in the middle. Recognition is automatic and on-device (CameraX + Google ML Kit), no shutter press. Text is validated against plate regex patterns. Can be cancelled. Min. Android API 21. |
| **Manual** | Dialog with a text field, letters and digits only. Buttons **Potvrdi** / **Odustani**. |
| **Voice** | Google Speech-to-Text plus an AI step that normalizes spoken letters ("ZE-GE" becomes `ZG`) and strips spaces and dashes. Meant for plates unreadable by camera (snow, mud). |

All three end the same way: the cleaned plate (no spaces or dashes, e.g. `ZG5545AI`) goes to the check.

### INS-4 Parking check
- Endpoint `check`, input `LicensePlate`. Target response time: 1.5 s max.
- Order of checks: privileged owners first (if a valid entry exists, stop there), then tickets.

| Status | Colour | Meaning |
|---|---|---|
| POVLAŠTENO PARKIRANJE | Green | Plate is on the privileged list and the privilege is still valid |
| PARKIRANJE VAŽEĆE | Green | Paid and still within time |
| PARKIRANJE ISTEKLO | Red | Paid, but time has run out |
| PARKIRANJE NIJE PLAĆENO | Red | Parking registered, but the card charge failed |
| PARKIRANJE NIJE PRIJAVLJENO | Red | No ticket for this plate |

- Response fields: `status`, `statusColor`, `owner`, `licensePlate`, `zone`, `validUntil`, `dateFirstObserved`, `overageMinutes`, `dailyTicket`, `ticketId`.
- Result dialog always has **U redu**. On a red result it also shows one of:
  - **Izdaj dnevnu parkirnu kartu**, enabled only once 15 minutes have passed since first observation, or
  - **Ispiši dnevnu parkirnu kartu**, if a DPK was already issued for that plate (`dailyTicket = true`).

### INS-5 First observation
- The first red check for a plate writes a row to `PARKING_OBSERVATIONS` (plate, time, inspector, tenant). Later checks do not add another.
- The time is recorded by the server, not typed by the inspector. It starts the waiting period before a DPK can be issued.

### INS-6 Issue DPK
- **Preconditions:** a first observation exists and the waiting period has passed (`DpkIssueDelayMinutes` on the zone, default 15); the vehicle has no valid parking (otherwise the API returns an error naming the zone and valid-until time); no DPK already issued for that plate that day.
- **Inspector enters:** ticket number (typed from the pre-printed payment slip, or scanned from its barcode), zone (prefilled from the purchased ticket if there is one), vehicle brand (fixed list), address where the vehicle was found, and vehicle photos.
- **Photos:** a minimum number is required, set per city (for example 3). **U redu** stays disabled until they are taken.
- **Backend:** creates a ticket of type `Dnevna` priced from the zone's `DailyTicketPrice`, valid 24 hours; fetches vehicle owner data from MUP (never shown to the inspector); fiscalizes; returns the DPK.
- **Print:** automatic, on a Bluetooth portable printer using ESC/POS commands. QR code via the ZXing library if the printer cannot print QR natively.

### INS-7 Reprint DPK
- `GetDPK` returns an existing DPK by `TicketId`; the app prints it again without creating a new one.

---

## 3. SPARK Admin (web)

React web app for the city / operator. Works on desktop and tablet.

| ID | Feature | What it does |
|---|---|---|
| ADM-1 | Login | Username and password. |
| ADM-2 | Zones | List, add, edit, delete parking zones: code, name, price, daily ticket price, duration, max extensions, DPK waiting period. |
| ADM-3 | Privileged owners | List, add, edit privileged plates: plate, valid until, owner name and address. |
| ADM-4 | Tickets | Real-time table of paid tickets with filters: date, zone, plate, fiscalization status. |
| ADM-5 | DPK | Overview of DPKs issued in the field, issuing, and later fiscalization of ones that failed. |
| ADM-6 | Inspectors | List and edit Inspector app users (name, OIB, PIN, active flag). |
| ADM-7 | Reports and export | Financial and statistical reports, export to PDF or automatic send to a predefined e-mail. Generated with the reporting tool already used on other projects. |
| ADM-8 | City settings | View and update city data: OIB, address, IBAN, fiscalization data. |
| ADM-9 | Admin users | List and edit back-office users. |

---

## 4. Platform (backend)

### PLT-1 API structure and security
- Three controller groups under `api/v1/...`: **Admin** (one controller per entity: Ticket, DPK, Inspector, Privilege, Zone, Tenant, Admin), **Inspector** (`login`, `check`, `issue-dpk`, `get-dpk`) and **Wapp** (WhatsApp webhook).
- HTTPS only.
- Admin and Inspector calls need an `X-API-KEY` header (issued by Softlab; also used to check the licence) and a JWT bearer token, except `login`.
- The JWT carries `TenantId` and `InspectorId` and lasts 10 hours.
- The WhatsApp webhook cannot use an API key; requests are validated with the `X-Hub-Signature-256` header.
- `login` is rate limited to 5 requests per minute per IP.

### PLT-2 Asynchronous transaction pipeline
The HTTP request only validates and stores the transaction; everything slow happens in background workers inside the same Web API process.

1. Web API validates the request, inserts the ticket into `spark_work.TICKETS` with all statuses `PENDING`, queues its ID and returns.
2. **Payment workers** claim the ticket and charge it through Viva.
3. On success the ID goes to two independent queues:
   - **Fiscal workers** fiscalize, save JIR and ZKI, and copy the finished ticket to `spark_central`.
   - **Wapp workers** send the WhatsApp confirmation, without waiting for fiscalization.

- Each stage has its own status: `PENDING` → `PROCESSING` → `DONE` or `FAIL`. A worker claims a ticket with a conditional update, so only one worker processes it.
- Queues are in-memory, bounded `Channel<T>` (10,000 items). Only the ID travels through them; data is always read from the database.
- The database is the source of truth. After a restart, unfinished tickets are re-queued at startup. No periodic database polling.
- Worker counts are set per queue (starting point: 10 payment, 4 fiscal, 4 WhatsApp).
- A failure in one stage never re-runs another: retrying fiscalization never charges the card again, retrying WhatsApp never repeats payment or fiscalization.

### PLT-3 Payments and card tokens
- Viva.com, implemented behind a factory so other gateways can be added later.
- Card data lives only at Viva. SPARK never stores the CVC or full card number (PCI-DSS); it stores a token per phone number in `PAYMENT_TOKENS`.
- Repeat charges reference the first successful Viva transaction.
- A declined card is final and is not retried. A technical error (timeout, 5xx, network) is retried.
- No double charging: before retrying after a timeout, check the status of the previous attempt or use the provider's idempotency mechanism.

### PLT-4 Fiscalization
- Every ticket and DPK is fiscalized with CIS at transaction time.
- If CIS is unreachable, the ticket stays paid and a background worker fiscalizes it later.

### PLT-5 Vehicle owner lookup (MUP)
- Needed so an unpaid DPK can be followed up. Input: plate. Output: owner and, if present, leasing user.
- Requires the city's MUP certificate and VPN access. Certificate and password are stored encrypted; the key is in the Windows environment variable `SPARK_ENCRIPTION_KEY`.
- Retries a configurable number of times on failure.
- For development, a mock endpoint returns dummy data.

### PLT-6 Data model
| Database | Role | Tables |
|---|---|---|
| `spark_work` | Durable queue for incoming transactions | `TICKETS`, `TICKET_TYPES`, `PARKING_OBSERVATIONS` |
| `spark_central` | Main business database, current year | `CITY_TENANTS`, `ZONES`, `TICKET_TYPES`, `TICKETS`, `PRIVILEGED_OWNERS`, `PARKING_OBSERVATIONS`, `INSPECTORS`, `PAYMENT_TOKENS`, `VEHICLE_BRANDS` |

- `TICKETS` has the same structure in both databases. Ticket types: `Standard` (default) and `Dnevna` (DPK).
- `spark_work` cleanup: completed tickets older than 30 days are deleted; unresolved ones are kept.

### PLT-7 Year-end archiving
- The active database is always called `spark_central`, so no code or connection string changes between years.
- After midnight on 1 January, the stored procedure `zakljuci_godinu` runs: backup → verify → restore as an archive database → integrity check → compare ticket counts → set archive read-only → delete old tickets from the active database in batches.
- Master data (cities, zones, inspectors, settings) stays in the active database.

### PLT-8 Non-functional requirements
- Plate check answers within 1.5 s.
- 99.9% availability, running 24/7.
- All traffic over HTTPS, with API-key checks wherever possible.

---

## 5. Open questions in the spec

Points where the spec contradicts itself or leaves a gap. Worth settling before building.

1. **Status values.** Three different sets appear (`PENDING/AUTHORIZED/DECLINED/RETRY`, `NEW/PAYMENT_PENDING/…`, `PENDING/PROCESSING/DONE/FAIL`). The table definition uses the last one.
2. **Polling vs. channels.** One chapter describes workers polling the database every second; a later one says no polling, `Channel<T>` only.
3. **When is the WhatsApp confirmation sent?** One chapter says after fiscalization and transfer to `spark_central`; another says right after payment, independent of fiscalization.
4. **`TICKETS` column names.** Columns are named `PaymentStatus…`, but constraints, queries and classes use `VivaStatus…`. There is no `WappStatus` column, although the pipeline needs one.
5. **`TransactionId` type.** `BIGINT IDENTITY` in the table, `Guid` in the channels (`TicketId` is the GUID).
6. **Where tables live.** `PAYMENT_TOKENS` is described both in the work database and only in `spark_central`. The check is said to query `spark_work`, but `PRIVILEGED_OWNERS` exists only in `spark_central`.
7. **Archive database name.** `spark_central_2026` in the text, `spark_2026` in the stored procedure.
8. **DPK request.** `IssueDPKRequest` only has `LicensePlate` and `Zone`; ticket number, brand, address and photos are required but missing. Photo upload and storage are not described.
9. **DPK payment.** The spec says card authorization starts after a DPK is saved. Whose card, and how a DPK is paid, is not explained.
10. **DPK validity.** "Valid for the next 24 hours" vs. sample data ending at 23:59:59 the same day vs. "one per plate per day".
11. **Per-city settings.** Minimum photo count is "set per city" and IBAN is in city settings, but `CITY_TENANTS` has neither column.
12. **Admin users.** No table or login flow is defined for back-office users; the JWT audience is only `SPARK_INSPECTOR`.
13. **Inspector login.** How the app knows its `TenantId` is not stated, and PINs are not unique per tenant.
14. **Reminder timing.** "15 minutes" in most places, "x minutes" in the use case.
15. **Languages.** Foreign drivers are promised a chat in their own language; no language list or detection rule is given.
16. **Smaller errors.** `INSPECTORS` references `dbo.TENANTS` (should be `CITY_TENANTS`); `statusColor` is described as hex but samples use `Green`/`Red`; zone code examples vary (`708001`, `708101`); the ANPR sample code has no regex filter although the text relies on one.
