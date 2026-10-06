# spark-admin

Web back office for SPARK, the Samobor city parking platform. Runs against an
MSW mock API until the backend is ready. See `AGENTS.md` for how the project
works.

## Setup

Requires Node ≥ 22.22.2 and pnpm.

```sh
pnpm install
pnpm exec playwright install chromium   # once, for the e2e suite
pnpm dev                                # http://localhost:5173, mock API on
```

## Checks

```sh
pnpm check   # typecheck, lint, format, unit tests, build
pnpm e2e     # Playwright at phone and desktop widths
```
