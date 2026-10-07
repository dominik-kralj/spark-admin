# Coding standards

Boring, readable React + TypeScript, optimised for fast review and low
cognitive overhead. Where these rules meet a hard requirement in
`docs/HANDOFF.md` or a seam in `AGENTS.md`, those win.

Prefer clear code over clever code, and follow the existing pattern before
introducing a new one. Zone (#10–#14) is the reference slice for screens.

## Principles

- **KISS.** The simplest code that meets the requirement. No cleverness that a
  reviewer has to decode.
- **DRY.** Logic, markup patterns and style values are written once. Before
  writing a helper, search for one; on the second copy of anything, extract it.
- **YAGNI.** Build what the issue asks for, not what a later issue might need.
  No options, parameters or abstractions without a current caller.
- **Extract reusable logic.** A helper that isn't tied to one feature (DOM
  helpers, ref callbacks, formatting, mapping, validation) goes in
  `shared/lib/` from its first use, one concern per file. Logic tied to one
  feature gets its own file in that feature, not a function at the top of a
  component.

## Scope

Change only what the issue asks for. Refactors, renames and cleanups of nearby
code are new issues unless the user asks for them in this one.

## Formatting

Prettier formats (4-space indent, no semicolons, single quotes); it keeps
blank lines but cannot add them, so spacing is on you:

- One blank line between import groups: side-effect imports, packages, then
  `@/` and relative imports.
- One blank line between logical blocks in a function: hooks, derived values,
  handlers, early returns, and before the final `return`.
- In JSX, one blank line between sibling sections (header, filters, table,
  pagination), so each section reads as a block.

## Comments

Default to no comment: names, types and tests carry the meaning, and the design
or spec reference belongs in the PR, not the code. Write a comment only when the
code would otherwise invite a wrong change, such as a guard that looks redundant
or a workaround for a library gap. Then it is one line. Removed code is deleted;
git keeps it.

## Functions

- Small and focused. Early returns over nesting.
- One condition per ternary (`no-nested-ternary`). Three or more outcomes
  become an early return, a `switch`, or a lookup object.
- At most 2 parameters for new or heavily rewritten functions. More inputs go
  in one typed object parameter with descriptive names, destructured when that
  reads better.
- Keep validation, transformation, rendering, side effects and state updates
  in separate steps unless the combined function is still easy to scan.
- `src/` holds no `console` calls (`no-console`): the API module carries the
  token and key, and a stray log is how they leak.

## Variables

Create a variable when it lowers the reader's load: the expression is reused,
hard to scan inline, passed to several places, separates business logic from
rendering, or its name explains domain meaning. Inline the rest: simple props,
simple booleans, obvious expressions.

```tsx
const hasUnreadNotifications = unreadCount > 0

return <Badge hidden={!hasUnreadNotifications} />
```

Not a chain of renames:

```tsx
const count = unreadCount
const isCountPositive = count > 0
const shouldShowBadge = isCountPositive

return <Badge hidden={!shouldShowBadge} />
```

## TypeScript

- Precise domain types (from the feature's `validators/`), explicit `null`
  and optional behaviour. A field is optional because the domain says so,
  never to silence an error.
- No `any` (typescript-eslint strict). Fix a type error at its source when the
  source is in scope; a narrow `as` is acceptable only where it is safer than
  changing unrelated code.
- Zod schemas and their types stay aligned: derive the type with `z.infer` /
  `z.output` rather than writing it twice.

## React

### State

Keep state minimal and owned in one place:

- the server cache (TanStack Query) owns server data;
- the parent owns shared state;
- a child owns its local UI state.

Derive values during render rather than storing them. Copy props or query data
into state only for a real editable draft, and a form draft lives in React Hook
Form. Move state higher only when behaviour requires it.

### Effects

`useEffect` is for synchronising with something outside React: subscriptions,
timers, DOM and browser APIs, imperative third-party APIs, cleanup on unmount.
Before adding one, check whether the value can be computed during render,
handled in the event handler, or owned by the parent.

```tsx
const visibleItems = items.filter((item) => item.isVisible)
```

Not:

```tsx
const [visibleItems, setVisibleItems] = useState<Item[]>([])

useEffect(() => {
  setVisibleItems(items.filter((item) => item.isVisible))
}, [items])
```

### Memoization

`useMemo`, `useCallback` and `memo` are for a real problem: an expensive
computation, a stable reference a dependency-sensitive API needs, a measured
re-render issue, or a memoised child that actually benefits. A function or
object being recreated on render is not one. The `vercel-react-best-practices`
skill (see `AGENTS.md`) covers the measured cases.

### Components

- Focused, with small prop lists. Extract a component when the current one is
  hard to scan or the piece is reused, not to cut line count.
- Generic components live in `shared/ui/` and exist because two features use
  them; one-off UI stays in its feature.
- Keep related logic close together.

## Forms

React Hook Form + Zod, following the Zone form: schema and form ↔ domain
mapping in the feature's `validators/<entity>Form.ts`, shared plate/OIB/PIN
pieces from `shared/lib/validation.ts`. Edit forms load their draft with
RHF's `values` or `reset`, not an effect that copies query data. New form
abstractions only when asked.

## Tables

Follow the Zone list. Keep column definitions readable; a cell renderer that
gets dense becomes a small named component or helper. The phone card layout
renders the same domain fields as the table.

## Strings

Every user-visible string, aria-labels included, goes in `shared/i18n/hr.ts`
in the same change that uses it (handoff hard requirement). Dates, times and
amounts go through `shared/lib/format.ts`.

## Styling

- Chakra v3 style props and recipes, with the theme's semantic tokens
  (`bg.subtle`, `fg.muted`, `colorPalette="blue"`); never raw hex. The theme is
  light only.
- How a component looks everywhere (borders, padding, invalid and focus states)
  lives in a recipe override in `shared/theme/recipes/`, one file per
  component, not in style props or style objects in components. Style props in
  a component are for layout and one-off cases only. `system.ts` is a copy of
  the design export, so overrides never go there.
- Conditional styling stays shallow: one condition per prop. Repeated or
  tangled styling becomes a recipe or a small helper.
- Hover, active, selected, disabled and loading states stay distinct, and
  status is never shown by colour alone. UI-state booleans read as questions
  (`isExpanded`, `hasError`).
- Icons follow the nearby code. Styling outside the issue's scope stays as is.

## Data fetching

- TanStack Query hooks live in the feature's `api/use<Feature>.ts`, with one
  query-key factory per entity there, so keys are predictable and centralised.
- After a mutation, update or invalidate the narrowest key that keeps the UI
  correct (`setQueryData` for the edited row, the list key on create or delete).
- Polling (Karte's new-ticket count) updates the count, never the visible
  rows; rows enter when the user acts.
- Responses are parsed with Zod in the feature's `validators/` before anything
  else sees them.

## Before finishing

Run through this before the gate:

- Did the change stay inside the issue's scope?
- Is the code easy to scan, with names doing most of the explaining?
- Is anything written twice, or a reusable helper left inside a component?
- Is any styling in a component that belongs in a recipe?
- Is every comment one the code can't do without?
- Any avoidable nesting, duplicated state, `useEffect`, variable, comment,
  cast or memo hook?
- Is every user-visible string in `hr.ts`?
