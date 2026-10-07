# HANDOFF: SPARK Admin (web back office)

## Context

SPARK is a city parking platform for Samobor, Croatia. Drivers pay over
WhatsApp, inspectors check vehicles in an Android app, and the city runs
everything from a web back office. You are building the back office frontend.
The backend (C# .NET Web API) is built by others and is not ready.

## Read first

- `docs/SPARK-feature-docs.md`: short feature summary. Section 3 (ADM-1 to ADM-9)
  is your scope. Section 5 lists open questions in the spec.
- `docs/spark-spec-full.md`: full spec in Croatian. Use it for field names,
  the CREATE TABLE statements and business rules. It is long; search it, do
  not read it end to end.
- `docs/design/`: design export. Follow it for layout, colour, type and spacing.

## Stack

- React + TypeScript, Vite.
- Chakra UI (current major version). Check the installed version's docs before
  using an API; do not rely on older Chakra patterns from memory.
- React Router, TanStack Query, React Hook Form + Zod.
- Vitest + Testing Library, with axe checks. ESLint with jsx-a11y, Prettier.
- MSW for the mock API.

## Backend contract

- The spec defines no Admin endpoints. Only this is known: base path api/v1,
  HTTPS, an X-API-KEY header, and a JWT bearer token after login.
- Build against a mock API (MSW). Derive entity shapes from the CREATE TABLE
  statements in the spec: ZONES, PRIVILEGED_OWNERS, INSPECTORS, TICKETS,
  CITY_TENANTS.
- Write every endpoint and shape you assume into `docs/api-assumptions.md`, so
  the backend team can confirm or correct it.
- Keep all API types and calls in one module. The spec is inconsistent about
  names (PaymentStatus vs VivaStatus), so nothing outside that module may
  depend on raw field names.
  _Changed (#45): each feature owns its calls and validators instead. Raw
  field names stay inside a feature's `validators/`, so the naming drift is
  still absorbed at one boundary per feature. See `AGENTS.md`._
- Read the API base URL and key from environment config. Never hardcode them.

## Screens

1. Login (username, password).
2. App shell: navigation Karte, DPK, Zone, Povlašteni korisnici, Kontrolori,
   Izvještaji, Postavke grada, Korisnici; header with city name, user, Odjava.
3. Karte: paid tickets table, filters (date range, zone, plate, fiscalization
   status), pagination, detail view.
4. DPK: daily parking tickets, detail with vehicle photos, "fiscalize again"
   on failed rows.
5. Zone: list and add/edit/delete.
6. Povlašteni korisnici: list and add/edit. Expired entries look different.
7. Kontrolori: list and add/edit, active toggle.
8. Izvještaji: choose report, date range, zone; export PDF or send by e-mail.
   Report types are undefined: build the screen with placeholder reports.
9. Postavke grada: one form.
10. Korisnici: list and add/edit.

## Hard requirements

- UI text in Croatian, all strings in one place (no literals in components).
  Dates dd.MM.yyyy, 24-hour time, amounts like 0,70 EUR.
- Responsive from 320 px to desktop. On phones tables become cards, filters
  move into a drawer, navigation becomes a drawer, forms are one column.
- Accessibility, WCAG 2.2 AA: keyboard operable throughout, visible focus,
  labelled fields, errors as text tied to the field, focus managed in dialogs
  and drawers, status never by colour alone, 44 px touch targets.
- Every data screen has loading, empty and error states.
- Plate inputs normalise to uppercase without spaces (ZG1234AB). OIB is 11
  digits. Inspector PIN is digits only, up to 4.
- The Karte table must not shift while being read: show a "new tickets"
  indicator instead of inserting rows automatically.
- Confirm destructive actions by naming the item. Warn on unsaved changes.

## How to work

- Build in milestones and stop for review after each one:
  - M0 Project setup, theme tokens from the design, mock API, string file.
  - M1 App shell, login, protected routes.
  - M2 Zone, complete, as the reference slice: list, form, validation, all
    states, tests. Later screens copy its patterns.
  - M3 Povlašteni korisnici, Kontrolori.
  - M4 Karte.
  - M5 DPK.
  - M6 Postavke grada, Korisnici, Izvještaji.
- Before each milestone, state the plan in a few lines. After it, list what
  was built, what was assumed, and what is still open.
- If the design and this brief disagree: design wins on visuals, this brief
  wins on behaviour. If the spec is silent or contradicts itself, ask; do not
  invent a rule.
- Tests for every form (validation, submit, error) and an axe check per screen.

## Out of scope

No dashboard, charts, maps or role management. No Inspector app, WhatsApp bot
or backend work.
