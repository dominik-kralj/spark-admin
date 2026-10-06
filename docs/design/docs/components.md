# Component rules

Taken from the component sheets in `components/`. Open the sheet next to each section to see the component itself. Token names refer to `theme/tokens.json`.

## Status chips, buttons, icons

Sheet: `components/status-chips-buttons-icons.html`

### Status chips

Chakra Badge, 24 px high, 4 px radius, 13 px medium text. Every chip carries an icon and a text label, so status never depends on colour alone. Each status uses a different icon shape and a different lightness.

### Buttons

40 px high on desktop, 44 to 48 px on phone and tablet. 6 px radius, 600 weight label. One primary button per view.

### Icons

One line-icon set throughout (Lucide, 24 px grid, 2 px stroke, round caps). Icons inherit the text colour and are decorative next to a label.

## Table and its card form

Sheet: `components/table-and-card.html`

### Table, 768 px and wider

- Chakra Table with real header cells. Only sorting, pagination and the filter bar; no pinning, in-cell editing or resizing.
- Row 1 is the resting state, row 2 is hover (gray.50), row 3 shows keyboard focus on the row link.
- The plate is the one link in each row and opens the detail drawer. Clicking anywhere on the row does the same for mouse users.
- Sortable headers are buttons. The sorted column shows a single arrow and sets aria-sort; the others show a neutral up-down icon.
- Rows are 48 px on desktop and 52 px on tablet. Amounts are right-aligned with tabular numerals.
- Filters, sort order and page are kept in the URL, so they survive opening a row and coming back.

### Card, below 768 px

- Each row becomes one list item with the 3 to 4 fields people scan for. Everything else is in the detail view.
- The top line is the link, 48 px high. Status chips keep their column name as a label, because the name is no longer in a header.
- No horizontal scrolling of the page.

### Loading, empty and error

Every list replaces its table or cards with one of these. The page title, search and filters stay in place. Each list screen has its states as separate files: `--loading`, `--empty` and `--error`.

- Skeletons match the row height of the real table, so nothing jumps when data arrives. They are static when reduced motion is on.
- Empty states say why the list is empty and offer the one action that fixes it.
- Error states say what failed and what to do next, and always include a retry.

## Filters

Sheet: `components/filters.html`

### Filter bar, desktop

- Plate search comes first and takes the spare width. It accepts any casing and spacing (zg 1234-ab) and normalises to ZG1234AB when the field loses focus.
- Filters apply on Pretraži or Enter, not on every keystroke. Each active filter appears as a tag whose whole surface removes it.
- Dates are typed as DD.MM.GGGG. A calendar picker can be added later; Chakra does not ship one by default.

### Filters on phone and tablet

- Below Chakra's lg breakpoint the inline bar collapses to a Filteri button. Plate search stays on the page, because it is the most common task.
- The button shows how many filters are active. Its accessible name says the same: Filteri, 2 aktivna.
- The drawer is full screen on phone and a side drawer on tablet. It traps focus, closes with Esc and returns focus to the Filteri button.
- Tags and buttons are at least 44 px high on touch screens.
- Nothing is applied until Prikaži rezultate, so the list behind does not reload on each change.

## Forms

Sheet: `components/forms.html`

### Field states

Default. Label always visible above; 1 px gray.500 border, 4.47 : 1.

Focus. 2 px blue.700 ring with 2 px offset, 5.75 : 1 on white.

Help text sits under the field in gray.600, 6.38 : 1.

Error. 2 px red.700 border, icon and text, 6.57 : 1.

Read-only. gray.100 fill, gray.700 text, 8.30 : 1. Still readable and focusable.

### Field types

Plate. Monospace; spaces and dashes are removed and letters upper-cased on blur.

Select. Chakra NativeSelect, so phones get the system picker.

PIN and password. Hidden by default with a show button named Prikaži PIN.

Switch. State is shown by knob position and the word Da or Ne, not by colour alone.

### Error summary

Shown at the top of a form after a failed save. It receives focus, each line links to its field, and the same text appears next to the field. red.800 on red.50, 7.92 : 1.

### Rules

- One column on phone. Two columns from 768 px, only where the fields belong together: name and surname, street and house number, postcode and city.
- Every field has a visible label. Placeholders are examples only, never the label.
- Validate when the user leaves a field, not on each keystroke. Clear the error as soon as the value becomes valid.
- Error text says what is wrong and what to do: what the field needs and what was entered.
- Inputs are 40 px high on desktop and 48 px on phone and tablet, with 16 px text on phone.
- Primary action on the right on desktop, on top when buttons stack on phone. Destructive actions sit apart from Spremi.
- Leaving a form with unsaved changes opens a confirmation. Saving ends with a toast, or with the error summary.

## Dialogs, toasts, detail drawer

Sheet: `components/dialogs-toasts-drawer.html`

### Confirmation dialogs

- The title is a question that names the item. Buttons repeat the verb (Obriši zonu, Deaktiviraj), never just OK or Da.
- Focus starts on the safe choice: Odustani for destructive dialogs, Nastavi uređivati for unsaved changes.
- Chakra Dialog with role alertdialog. Focus is trapped, Esc cancels, and focus returns to the button that opened it.
- The scrim is navy.900 at 45 %. On phone the buttons stack full width, 48 px high, with the primary on top.

### Toasts

- Bottom right on desktop, full width at the bottom on phone. White surface with a green.700 or red.700 border and icon.
- Success toasts close on their own after about 5 seconds and pause while hovered or focused. Error toasts stay until closed.
- An error toast says what happened, confirms the input was kept, and offers the retry.
- Success is announced politely (role status), errors immediately (role alert). They appear without sliding when reduced motion is on.

### Detail drawer

- Chakra Drawer, 560 px wide from the right on desktop and tablet, full screen on phone with a back button in place of the close button.
- Header and footer stay fixed; the body scrolls. The same shell holds read-only details and the add and edit forms.
- The title is a heading that names the record. Focus moves to it on open and returns to the row link on close.
- The list behind keeps its filters, sort order, page and scroll position.
