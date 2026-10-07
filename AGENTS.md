# SPARK Admin

Web back office for SPARK, the Samobor city parking platform. Frontend only; the
.NET backend is built by others and is not ready, so everything runs against an
MSW mock.

## Sources of truth

- `docs/HANDOFF.md`: scope, stack, screens, **hard requirements**, milestones.
  Read it at the start of every milestone. Its hard requirements are the
  definition of done for every screen.
- `docs/SPARK-feature-docs.md`: feature summary. §3 (ADM-1…ADM-9) is our scope,
  §5 lists the spec's open questions. Check §5 before raising a question.
- `docs/spark-spec-full.md`: full spec, in Croatian and long. **Search it**
  (`CREATE TABLE`, the table name, the Croatian term) for field names and
  business rules.
- `docs/design/`: the visual source. Design wins on visuals; the handoff wins on
  behaviour. Before building a screen, follow its `README.md` workflow: read the
  screen's HTML at every width it exists in, its state variants, and its section
  in `docs/accessibility.md`, then compare the result with `screenshots/`. Its
  "Decisions that are still open" table is part of `open-questions.md`. Treat the
  folder as read-only: it is a snapshot, re-copied when the design changes.
- `docs/api-assumptions.md`: the record of every endpoint, query param and
  payload shape we invented. Update it **in the same change** as any API code.
- `docs/open-questions.md`: questions waiting for the user or the backend team.
  When the spec is silent or contradicts itself, add an entry and ask; build the
  narrowest version that keeps the question open.

## Issue loop

Work comes from the GitHub issues (`gh issue view <n>`), one at a time, in
number order unless told otherwise. Milestones M0–M6 group them. The point is
thorough review, so keep each change to its issue's scope.

1. Read the issue and everything it points to. State the plan in a few lines
   and wait for approval.
2. Branch `issue-<n>-<slug>` from an up-to-date `main`.
3. Build test-first (`/tdd` skill).
4. Run the gate (below) until it's green.
5. Open a PR that says `Closes #<n>` and lists **built / assumed / open**, then
   stop for review. Each "assumed" item also lands in `api-assumptions.md` or
   `open-questions.md`.

An issue is done when its "Done when" list is met, every handoff hard
requirement that applies is met, **and each has a test or a stated manual
check**. Work found along the way that is outside the scope becomes a new
issue, not part of the current PR.

**Zone (#10–#14) is the reference slice.** Before building any later screen, open the
Zone files and copy their structure: list, form, query hooks, the three states,
tests. If a later screen needs to depart from the pattern, change Zone first so
the pattern stays single-sourced.

## Gate

Before you report anything as done, run `pnpm check` (typecheck, lint, format
check, tests, production build). Report failures verbatim.

The ESLint config enforces the library rules: `eslint-plugin-react-hooks`,
`@tanstack/eslint-plugin-query`, `jsx-a11y`, and `typescript-eslint` strict.
When a rule fires, fix the code; disabling a rule needs a comment that explains
why. For React, React Router, TanStack Query and RHF APIs, check context7 before
relying on memory.

## Structure

Feature-based. A feature folder owns everything for one area of the app:

```
src/
  main.tsx, App.tsx        entry and root (router arrives in M1)
  features/<feature>/      e.g. auth/, zones/, tickets/, daily-tickets/
    api/useZones.ts        the feature's API calls and TanStack Query hooks
    components/            route component and feature components, one per
                           file (ZonesPage.tsx, ZoneForm.tsx)
    validators/            Zod schemas, types derived from them, raw → domain
                           and form ↔ domain mapping (zone.ts, zoneForm.ts)
    lib/                   the feature's non-React helpers
  shared/                  used by two or more features
    api/                   fetch client, ApiError, session store (see seams)
    ui/                    generic components (StatusChip, ConfirmDialog, …)
    lib/  i18n/  theme/    helpers, strings, Chakra system
    config.ts  providers.tsx
  mocks/                   MSW handlers and seed data
  test/                    test setup and helpers
```

- A feature imports from `@/shared/*` and its own folder, never from another
  feature (lint catches the `@/features/` alias; relative paths are on you). Something two features need moves to `shared/`.
- Feature folders use kebab-case names; component files use PascalCase.
- Tests (`*.test.ts(x)`) sit in the same folder as what they test.

## Code style

`CODING_STANDARDS.md` holds the code rules: formatting, comments, functions,
state, effects, memoization, styling, data fetching. Read it before writing or
reviewing code, and run its "Before finishing" list before the gate.

## Performance

The `vercel-react-best-practices` skill (`.claude/skills/react-best-practices`)
holds React performance rules. Read the matching rule file when writing or
reviewing components. It is written for Next.js too, so in this client-only
Vite app: skip `server-*`; read `client-swr-dedup` as TanStack Query (already
deduplicates); read `next/dynamic` as `React.lazy`.

## Architecture seams

- **Feature API** (`features/<feature>/api/` + `validators/`):
  each feature owns its endpoints and query hooks. Raw backend field names
  live only in that feature's `validators/`, which parse responses with Zod
  and map raw → domain; everything outside sees domain types. The spec's
  naming drift (`PaymentStatus` vs `VivaStatus`) is absorbed there. This
  replaces the handoff's "one API module" rule (see the note in `HANDOFF.md`).
- **Shared API** (`src/shared/api/`): the fetch client (`request`), `ApiError`
  and the session store; the only place that knows the `X-API-KEY` header and
  the JWT. Holds nothing feature-specific. Import it through `@/shared/api`.
- **Mock** (`src/mocks/`): MSW handlers and seed data, shaped like the raw
  API (from the spec's CREATE TABLEs), not like the domain types. That way the
  mapping layer gets exercised. Tests use the same handlers and override them
  per test for error and empty cases.
- **Session** (`src/shared/api/session.ts`): token and user live in `sessionStorage`,
  so a reload keeps a 10-hour shift signed in, while closing the tab signs out
  and tabs don't share a login. Against XSS it is no weaker than memory here: a
  script in the page can read either. A `401` on a signed-in request ends the
  session; `ProtectedLayout` then goes to the login page and clears the query
  cache, the one path for both logout and expiry.
- **Config** (`src/shared/config.ts`): base URL and API key come from `import.meta.env.VITE_*`, read
  in one config file. `.env.example` lists every key.
- **Theme** (`src/shared/theme/system.ts`): a copy of `docs/design/theme/theme.ts`.
  Style with its semantic tokens (`bg.subtle`, `fg.muted`, `spark.heading`,
  `colorPalette="blue"`), never raw hex values.
  App-wide component styling goes in recipe overrides in
  `src/shared/theme/recipes/`, one file per component, never in `system.ts`.
- **Strings** (`src/shared/i18n/hr.ts`): every user-visible string, including
  aria-labels, validation messages and toasts. Components import keys from it.
- **Format** (`src/shared/lib/format.ts`): every date, time and money shown in the UI
  goes through these helpers.
- **Validation** (`src/shared/lib/validation.ts`): shared Zod pieces for plate, OIB
  and PIN, reused by every form and normalised on input (plates: uppercase, no
  spaces).

## Gotchas

- **Chakra UI**: the training data is mostly v2, and v3 changed the API
  (`createSystem` instead of `extendTheme`, compound components like
  `Dialog.Root` and `Field.Root`, snippets). Look up every component in the
  docs for the version in `package.json` before you write it (Chakra MCP or
  context7).
- **`hr-HR` Intl output differs from the required format.** Dates come out as
  `06. 10. 2026.` (spaces, trailing dot) and currency as `0,70 €`. Build
  `dd.MM.yyyy` and `0,70 EUR` explicitly, and pin both with unit tests.
- **Amounts** are numbers from the API; format only at render. Store and
  compare raw values, never formatted strings.
- **Karte** stays stable while being read: poll for a count of newer tickets
  and show the "new tickets" indicator. Rows enter only when the user acts.
- **OIB**: the handoff says "11 digits". Whether to add the ISO 7064 checksum
  is an open question; ask before enforcing it.
- **Newer majors than the training data**: React Router 8 (everything from
  `react-router`, `RouterProvider` from `react-router/dom`), MSW 3 (ESM-only,
  `onUnhandledRequest` is now `onUnhandledFrame`, the worker script is served by
  the `msw/vite` plugin rather than `public/`), Vitest 5 (mocks are cleared
  before each test, `toHaveTextContent` is strict). Read the installed package's
  `CHANGELOG.md` or types when an API is in doubt.
- **ESLint 10 + jsx-a11y**: jsx-a11y doesn't list ESLint 10 as a peer yet but
  runs correctly; the override is in `package.json` under `pnpm`.
- **Tooling**: pnpm only. Node ≥ 22.22.2 (React Router and jsdom require it).
  The dev machine is Windows: keep package scripts cross-platform (no `rm -rf`
  or inline `VAR=x`).

## Tests

- Test through the UI with Testing Library queries by role and label, against
  MSW. Avoid mocking fetch or hooks.
- Every form: validation messages, successful submit, server error.
- Every data screen: loading, empty, error, and one axe check
  (`expectNoAxeViolations` from `src/test/axe.ts`).
- Render with `renderWithProviders` from `src/test/render.tsx`, which uses the
  real providers and returns a `user` from user-event.
  Two layers, and every feature gets both:

- **Testing Library + MSW** (`pnpm test`, part of `pnpm check`): the bulk.
  Every form path, every screen state, normalisation, dialogs, axe.
- **Playwright** (`pnpm e2e`, run before each milestone report, not in
  `pnpm check`): what jsdom can't see. One main journey per feature at phone
  and desktop widths, responsive layout (cards, drawers), focus movement,
  touch targets, axe in a real browser. Specs live in `e2e/` as `*.spec.ts`,
  run in the `phone` (375 px) and `desktop` (1440 px) projects, and check axe
  with `expectNoAxeViolations` from `e2e/axe.ts`. The dev server starts on its
  own port with the mock API on.

## Glossary

The UI is in Croatian. Code identifiers, comments and commits are in English.

| UI (hr)             | Code (en)                  | Spec table                |
| ------------------- | -------------------------- | ------------------------- |
| Karta / Karte       | `Ticket`                   | TICKETS                   |
| DPK                 | `DailyTicket`              | TICKETS, type `Dnevna`    |
| Zona / Zone         | `Zone`                     | ZONES                     |
| Povlašteni korisnik | `PrivilegedOwner`          | PRIVILEGED_OWNERS         |
| Kontrolor           | `Inspector`                | INSPECTORS                |
| Postavke grada      | `CitySettings`             | CITY_TENANTS (tenant)     |
| Korisnik (admin)    | `AdminUser`                | none (feature docs §5.12) |
| Izvještaj           | `Report`                   | none (placeholders)       |
| Fiskalizacija       | `fiscalization` (JIR, ZKI) | TICKETS                   |
| Registarska oznaka  | `plate`                    | see spec                  |

Fix this table when the spec says otherwise. It is the naming source for code.
