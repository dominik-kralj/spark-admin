# SPARK Admin design handoff

Design reference for the SPARK Admin web back office (city parking, Samobor). Everything here is static: open any `.html` file in a browser, or read it as source for exact values.

The pages are a reference, not production code. They use plain HTML with inline styles so every size, colour and string is visible in place. Build the real screens with Chakra UI components and the tokens in `theme/`.

## What is in the folder

| Path | Contents |
| --- | --- |
| `screens/desktop-1440/` | All 10 screens at 1440 px, plus detail drawers, form drawers and state variants |
| `screens/phone-375/` | All 10 screens at 375 px, plus detail views, forms and state variants |
| `screens/tablet-768/` | App shell, Karte and Postavke grada at 768 px |
| `components/` | Status chips, buttons, icons, table and card, filters, forms, dialogs, toasts, detail drawer |
| `foundations/` | Logo sheet, colour tokens with contrast ratios, type scale |
| `screenshots/` | A PNG of every page above, same path and name |
| `theme/tokens.json` | Colours, contrast pairs, status chips, type scale, sizes, breakpoints |
| `theme/theme.ts` | Chakra UI v3 theme built from the tokens (typechecked against 3.37) |
| `logo/` | Mark and lockup as SVG: full colour, on dark, single colour, favicon |
| `docs/accessibility.md` | Heading levels, focus order and icon-only control names per screen |
| `docs/components.md` | Rules for each component, taken from the component sheets |

## How to use it with Claude Code

Copy the folder into the repository (for example as `design/`) and point Claude Code at it:

1. Read `design/README.md`, `design/theme/tokens.json` and `design/docs/components.md` once.
2. For the screen being built, read its HTML in `design/screens/` at all three widths that exist, its state variants, and its section in `design/docs/accessibility.md`.
3. Look at the matching PNG in `design/screenshots/` to check the result.

Take structure, copy, spacing and states from the HTML. Do not copy the markup or inline styles into the app.

## File naming

- Screens are numbered as in the brief: `01-prijava`, `02-ljuska`, `03-karte`, `04-dpk`, `05-zone`, `06-povlasteni`, `07-kontrolori`, `08-izvjestaji`, `09-postavke-grada`, `10-korisnici`.
- `-detalji` is the read-only detail view. `-obrazac` is the add or edit form.
- A double dash marks a state of the same screen: `--loading`, `--empty`, `--error`, `--no-error`, `--no-preview`, `--save-error`, `--load-error`, `--form-only`, `--no-dialog`, `--no-toast`, `--menu-expanded`. The file without a suffix is the default state.
- On desktop, detail and form files are 560 px wide: they show the drawer on its own. `05-zone-obrazac.html` shows a drawer in place over its list.
- The first line of every file is a comment with the board name, size and state.

## Screens

| Screen | Desktop 1440 | Phone 375 | Tablet 768 |
| --- | --- | --- | --- |
| Prijava (login) | `01-prijava.html` + `--error` | `01-prijava.html` + `--no-error` |  |
| Ljuska (app shell) | `02-ljuska.html` | `02-ljuska.html` | `02-ljuska.html` + `--menu-expanded` |
| Karte (paid tickets) | `03-karte.html` + `--loading`, `--empty`, `--error` | `03-karte.html` + `--loading`, `--empty`, `--error` | `03-karte.html` |
| Karte, detail | `03-karte-detalji.html` | `03-karte-detalji.html` |  |
| DPK (daily tickets) | `04-dpk.html` + `--loading`, `--empty`, `--error` | `04-dpk.html` + `--loading`, `--empty`, `--error` |  |
| DPK, detail | `04-dpk-detalji.html` | `04-dpk-detalji.html` |  |
| Zone | `05-zone.html` + `--loading`, `--empty`, `--error` | `05-zone.html` + `--loading`, `--empty`, `--error` |  |
| Zone, form | `05-zone-obrazac.html` | `05-zone-obrazac.html` |  |
| Povlašteni korisnici | `06-povlasteni.html` + `--loading`, `--empty`, `--error` | `06-povlasteni.html` + `--loading`, `--empty`, `--error` |  |
| Povlašteni korisnici, form | `06-povlasteni-obrazac.html` | `06-povlasteni-obrazac.html` |  |
| Kontrolori | `07-kontrolori.html` + `--loading`, `--empty`, `--error` | `07-kontrolori.html` + `--loading`, `--empty`, `--error` |  |
| Kontrolori, form | `07-kontrolori-obrazac.html` | `07-kontrolori-obrazac.html` + `--no-dialog` |  |
| Izvještaji | `08-izvjestaji.html` + `--no-preview`, `--loading`, `--error` | `08-izvjestaji.html` + `--no-preview`, `--loading`, `--error` |  |
| Postavke grada | `09-postavke-grada.html` + `--form-only`, `--save-error`, `--loading`, `--load-error` | `09-postavke-grada.html` + `--no-toast` | `09-postavke-grada.html` |
| Korisnici | `10-korisnici.html` + `--loading`, `--empty`, `--error` | `10-korisnici.html` + `--loading`, `--empty`, `--error` |  |
| Korisnici, form | `10-korisnici-obrazac.html` | `10-korisnici-obrazac.html` + `--no-dialog` |  |

Default states that differ between widths, so more states are visible at a glance: `01-prijava` shows the error on phone and the clean form on desktop; `07-kontrolori-obrazac` shows validation errors on desktop and the deactivate dialog on phone; `10-korisnici-obrazac` shows the unsaved-changes dialog on phone; `09-postavke-grada` shows the saved toast on desktop and phone and the error summary on tablet; `06-povlasteni-obrazac` adds a user on desktop and edits an expired one on phone.

## Responsive behaviour

| | Below 768 px | 768 to 1023 px | 1024 px and wider |
| --- | --- | --- | --- |
| Navigation | Top bar with a menu button; nav in a drawer | 72 px icon rail that expands over the page | Fixed 248 px sidebar |
| Tables | One card per row with 3 to 4 fields | Table with fewer columns | Full table |
| Filters | Plate search on the page; the rest behind Filteri | Same as phone | Inline filter bar |
| Forms | One column, buttons stacked | Two columns where fields belong together | Two columns where fields belong together |
| Detail and forms | Full screen | 560 px drawer | 560 px drawer |
| Touch targets | At least 44 px, inputs 48 px | At least 44 px, inputs 48 px | Controls 40 px |

Breakpoints are Chakra's defaults (`md` 768 px, `lg` 1024 px). The design must also hold at 320 px wide and at 200 % text zoom.

## Chakra components

| Design element | Chakra UI v3 |
| --- | --- |
| Data table, sortable headers | `Table`, header cells with a `button` inside, `aria-sort` on the sorted column |
| Row cards on phone | `Card` or a list of `Box` items; not a table |
| Status chip | `Badge` with `colorPalette`, an icon and a label (`statusChip` in `theme/theme.ts`) |
| Detail and form drawer | `Drawer` with 560 px wide content on desktop and tablet, `size="full"` on phone |
| Confirmations | `Dialog` with `role="alertdialog"` |
| Form fields | `Field` with label, helper text and error text; `Input`, `NativeSelect`, `Switch`; PIN and password are an `Input` with a show and hide button |
| Validity filter on Povlašteni korisnici | `Tabs` or `SegmentGroup` |
| Feedback after saving | Chakra's toaster (`createToaster`) |
| Loading | `Skeleton` in the shape of the rows it replaces |
| Paging | `Pagination` |

Chakra has no data grid, so tables stay simple: sorting, pagination and a filter bar. No column pinning, in-cell editing or resizing.

## Content conventions

- Interface language is Croatian. These notes and the component sheets are in English.
- Dates are `dd.MM.yyyy`, times are 24-hour, amounts look like `0,70 EUR`.
- Plates are stored and shown as `ZG1234AB`. Plate fields accept any casing and spacing and normalise when the field loses focus.
- OIB is exactly 11 digits. PIN is up to 4 digits.
- Text in square brackets, such as `[Naziv izvještaja 1]` or `[poruka pogreške]`, is a placeholder for content that is not defined yet.
- Sample data is invented apart from what the brief gave: Samobor, zones ZONA1 and 2A, plates ZG1234AB and ZG5553AI, 0,70 EUR and 15,00 EUR, inspector Marko Horvat.

## Decisions that are still open

These were not settled by the brief. The design picks one answer for each so the screens are complete.

| Topic | What the design does | Why it is open |
| --- | --- | --- |
| PIN length | Up to 4 digits ("Do 4 znamenke") | The brief says both "4-digit PIN" and "up to 4 digits" |
| Korisnici fields | Username, name, surname, password | The brief only says "simple list plus add/edit form" |
| DPK filters | Plate, date range, zone, fiscalization | The brief only asks for prominent plate search |
| Povlašteni korisnici tabs | Svi, Važeći, Istekli | Added so expired entries are easy to find |
| Date entry | Plain text fields in `DD.MM.GGGG` | No calendar picker is specified, and Chakra does not ship one by default |
| Report types | Placeholder names and columns | The list of reports is not defined yet |
| "Čekanje za DPK" | A number of minutes with no help text | The exact meaning of the DPK waiting period is not described |
| Expired privileged user | The form says the vehicle is charged like any other | Assumed behaviour, not stated in the brief |
| Deleting a zone | The dialog only says it is permanent | What happens to existing tickets in that zone is not described |
| Fonts | IBM Plex Sans and IBM Plex Mono | Chosen for the design; Chakra's default is different |

## Notes on the files

- Pages load IBM Plex from Google Fonts. Without a network connection they fall back to the system font and sizes shift slightly. The screenshots were rendered with the real fonts.
- Some pages link to each other (sidebar, row links, back buttons), so a flow can be clicked through in a browser. Links only work inside the same folder.
- Form fields in the pages are static samples.
- `theme/theme.ts` defines light mode only. The design has no dark theme.
- The same design also lives on the SPARK Admin canvas in Claude, where it was drawn. This folder is a snapshot of it.
