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
  api/                     the single API module (see seams below)
  features/<feature>/      e.g. zones/, tickets/, daily-tickets/, inspectors/
    ZonesPage.tsx          route component
    ZoneForm.tsx           feature components, one per file
    zoneFormSchema.ts      form schema and form ↔ domain mapping
    *.test.tsx             tests next to what they test
  shared/                  used by two or more features
    ui/                    generic components (StatusChip, ConfirmDialog, …)
    lib/  i18n/  theme/    helpers, strings, Chakra system
    config.ts  providers.tsx
  mocks/                   MSW handlers and seed data
  test/                    test setup and helpers
```

- A feature imports from `@/api`, `@/shared/*` and its own folder, never from
  another feature. Something two features need moves to `shared/`.
- Feature folders use kebab-case names; component files use PascalCase.
- API calls stay in `src/api/` even though features own their screens: the
  handoff requires one API module, so features never see raw field names.

## Code style

Prettier formats (4-space indent, no semicolons, single quotes); it keeps
blank lines but cannot add them, so spacing is on you:

- One blank line between import groups: side-effect imports, packages, then
  `@/` and relative imports.
- One blank line between logical blocks in a function: hooks, derived values,
  handlers, early returns, and before the final `return`.
- In JSX, one blank line between sibling sections (header, filters, table,
  pagination), so each section reads as a block.

Beyond formatting:

- **Comments carry the _why_.** A comment earns its line with something the
  code cannot say: a spec rule, a constraint, a gotcha, a pointer to an open
  question. Names and types carry the _what_. One line is the norm. Doc
  comments (`/** */`) go on exports whose name and type leave something
  unsaid. Removed code is deleted; git keeps it.
- **One condition per ternary.** Three or more outcomes become an early
  return, a `switch`, or a lookup object (`no-nested-ternary`).
- **Silent in production.** `src/` holds no `console` calls (`no-console`):
  the API module carries the token and key, and a stray log is how they leak.

## Performance

The `vercel-react-best-practices` skill (`.claude/skills/react-best-practices`)
holds React performance rules. Read the matching rule file when writing or
reviewing components. It is written for Next.js too, so in this client-only
Vite app: skip `server-*`; read `client-swr-dedup` as TanStack Query (already
deduplicates); read `next/dynamic` as `React.lazy`.

## Architecture seams

- **API module** (`src/api/`): the only place that knows raw backend field
  names, endpoint paths, the `X-API-KEY` header and the JWT. It exports domain
  types plus TanStack Query hooks, and it maps raw → domain at the boundary.
  The spec's naming drift (`PaymentStatus` vs `VivaStatus`) is absorbed here.
  Zod schemas that parse responses live here too.
- **Mock** (`src/mocks/`): MSW handlers and seed data, shaped like the raw
  API (from the spec's CREATE TABLEs), not like the domain types. That way the
  mapping layer gets exercised. Tests use the same handlers and override them
  per test for error and empty cases.
- **Config** (`src/shared/config.ts`): base URL and API key come from `import.meta.env.VITE_*`, read
  in one config file. `.env.example` lists every key.
- **Theme** (`src/shared/theme/system.ts`): a copy of `docs/design/theme/theme.ts`.
  Style with its semantic tokens (`bg.subtle`, `fg.muted`, `spark.heading`,
  `colorPalette="blue"`), never raw hex values.
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
  touch targets, axe in a real browser. The suite is set up with the first
  feature (M1, login journey).

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
