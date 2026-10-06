# Accessibility annotations

Target: WCAG 2.2 AA. One section per screen with heading levels, focus order and the accessible name of every icon-only control, followed by what changes on phone and tablet. Names in quotes are the exact accessible names to use.

These notes were written on the design canvas. Where one mentions a tweak or a board, the matching state in this folder is a separate file with a `--state` suffix (see the README), and "the Components page" is the `components/` folder.

## Rules for every screen

- Text contrast is at least 4.5:1; icons, input borders and focus rings at least 3:1. The computed ratios are in `theme/tokens.json`.
- Status never depends on colour alone: chips carry an icon and a label.
- Every interactive element has a visible focus ring (2 px blue.700, 2 px offset) and works with the keyboard alone, in reading order.
- Touch targets are at least 44 x 44 px on phone and tablet.
- Every field has a visible label. Errors are text next to the field, plus a summary at the top of the form after a failed save.
- Dialogs and drawers trap focus, close with Esc and return focus to the element that opened them.
- Layout holds at 200 % text zoom and at 320 px width without losing content.
- Tables have real header cells. Icon-only buttons have text names.
- Reduced-motion settings are respected and nothing is conveyed by animation alone.
- The first focus stop on every page is a skip link, "Preskoči na sadržaj", visible only when focused.

## 01 Prijava

Headings: h1 is the logo lockup, SPARK Admin.

Focus order: 1 Korisničko ime, 2 Lozinka, 3 Prijava.

Error: shown above the fields as role=alert and given focus. It does not say which of the two values is wrong. Field values are kept.

Icon-only controls: none.

The tweak 'pogreska' shows the error state. It is on by default on the phone board.

## 02 Ljuska

Landmarks: nav 'Glavna navigacija', header, main. Headings: h1 is the page title, inside main.

Focus order: 1 skip link 'Preskoči na sadržaj' (visible only when focused), 2 logo link, 3 to 10 nav items top to bottom, 11 Odjava, then main.

Current page: aria-current=page, shown by fill and bold weight, not colour alone.

Icon-only controls: none on desktop. Tablet rail: each icon link is named by its page (Karte, DPK and so on); the toggle is 'Proširi izbornik'. Phone: 'Otvori izbornik', 'Zatvori izbornik'.

## 03 Karte

Headings: h1 Karte. Drawer: h2 'Karta ZG1234AB', h3 Podaci o karti, h3 Transakcija i fiskalizacija. Empty and error states: h2.

Focus order: 1 Registracija, 2 Datum od, 3 Datum do, 4 Zona, 5 Fiskalizacija, 6 Pretraži, 7 Očisti, 8 filter tags, 9 Prikaži nove karte, 10 sortable headers, 11 plate link in each row, 12 pagination.

Live updates: new tickets never push rows down. The banner is role=status and loads them only when pressed.

Icon-only controls: 'Prethodna stranica', 'Sljedeća stranica'; in the drawer 'Zatvori detalje karte', 'Kopiraj broj transakcije', 'Kopiraj JIR', 'Kopiraj ZKI'. Filter tags are named 'Ukloni filter …'.

Drawer: traps focus, Esc closes, focus returns to the plate link.

## 04 DPK

Headings: h1 DPK. Drawer: h2 'Dnevna karta ZG9087KL', h3 Podaci o dnevnoj karti, h3 Fotografije vozila, h3 Fiskalizacija.

Focus order: filters as on Karte, sortable headers, then per row the plate link and, on failed rows only, Fiskaliziraj ponovno; then pagination.

Row action: named with the plate, 'Fiskaliziraj ponovno DPK za ZG9087KL'. While it runs the chip changes to U obradi; the result is announced by a toast.

Photos: each is a button, 'Povećaj fotografiju 1 od 3'. Real photos need alt text such as 'Fotografija vozila ZG9087KL, 1 od 3'.

Icon-only controls: pagination arrows, 'Zatvori detalje dnevne karte'.

## 05 Zone

Headings: h1 Zone. Drawer: h2 'Uredi zonu ZONA1' or 'Dodaj zonu'.

Focus order: 1 Dodaj zonu, 2 Šifra header (sort), 3 per row Uredi then Obriši. In the drawer: Zatvori, the seven fields left to right and top to bottom, Obriši zonu, Odustani, Spremi.

Icon-only controls: 'Uredi zonu ZONA1', 'Obriši zonu ZONA1' (always named with the zone code), 'Zatvori obrazac'.

Delete opens 'Obrisati zonu ZONA1?' with focus on Odustani. Closing the drawer with edits opens 'Odbaciti nespremljene promjene?'. Both are on the Components page.

## 06 Povlašteni korisnici

Headings: h1 Povlašteni korisnici. Drawer: h2 'Dodaj povlaštenog korisnika' or 'Uredi korisnika ZG9087KL'.

Focus order: 1 Dodaj korisnika, 2 Registracija search, 3 tabs Svi, Važeći, Istekli (one tab stop, arrow keys move between them), 4 sortable headers, 5 per row Uredi then Obriši.

Expired entries differ in four ways: a chip with an icon and the word Isteklo, the date in red.800 medium weight, a tinted row, and their own tab.

Icon-only controls: 'Uredi korisnika ZG5553AI', 'Obriši korisnika ZG5553AI', 'Zatvori obrazac'; on phone 'Dodaj povlaštenog korisnika'.

Plate field: any casing and spacing, normalised on blur; help text is tied to the field with aria-describedby.

## 07 Kontrolori

Headings: h1 Kontrolori. Drawer: h2 'Dodaj kontrolora' or 'Uredi kontrolora'; the error summary title is h3.

Focus order in the drawer: Zatvori, Ime, Prezime, OIB, PIN, Prikaži PIN, Aktivan, Odustani, Spremi. After a failed save focus moves to the error summary; its links jump to the fields.

Validation runs on blur. OIB is exactly 11 digits, PIN up to 4. Errors are text next to the field (aria-invalid, aria-describedby) plus the summary.

Switch: role=switch named Aktivan; state shown by knob position and the word Da or Ne. Turning it off asks 'Deaktivirati kontrolora Marko Horvat?'.

Icon-only controls: 'Uredi kontrolora Marko Horvat', 'Prikaži PIN' / 'Sakrij PIN', 'Zatvori obrazac'; on phone 'Dodaj kontrolora'.

## 08 Izvještaji

Headings: h1 Izvještaji, h2 Pregled izvještaja, h3 the report name.

Focus order: 1 Izvještaj, 2 Datum od, 3 Datum do, 4 Zona, 5 Prikaži pregled, 6 Izvezi PDF, 7 Pošalji e-poštom, then the preview table.

Izvezi PDF and Pošalji e-poštom appear only once a preview exists. The preset address is shown as text and tied to the send button with aria-describedby. Export and sending end with a toast.

Preview table: real header cells. On phone it scrolls sideways inside its own focusable region; the page does not.

Report names and columns are placeholders until the list of reports is defined.

Icon-only controls: none.

## 09 Postavke grada

Headings: h1 Postavke grada, h2 Podaci o gradu, h2 Fiskalizacija. With errors, the summary title is an h2 and comes first.

Focus order: Naziv, OIB, Adresa, IBAN, Oznaka poslovnog prostora, Oznaka naplatnog uređaja, Stopa PDV-a, Odustani, Spremi promjene.

Two columns from 768 px, one on phone. Reading and focus order stay left to right, top to bottom.

Saving ends with a success toast (role=status) or with the error summary at the top, focused. The tablet board shows the error state; the tweak 'prikaz' shows the others.

Icon-only controls: 'Zatvori obavijest' on the toast.

## 10 Korisnici

Headings: h1 Korisnici. Drawer: h2 'Dodaj korisnika' or 'Uredi korisnika'.

Focus order: 1 Dodaj korisnika, 2 Korisničko ime header (sort), 3 per row Uredi then Obriši. Drawer: Zatvori, Korisničko ime, Ime, Prezime, Lozinka, Prikaži lozinku, Odustani, Spremi.

The signed-in user is marked Vi and has no delete button.

Icon-only controls: 'Uredi korisnika marin.loncar', 'Obriši korisnika marin.loncar', 'Prikaži lozinku', 'Zatvori obrazac'; on phone 'Dodaj korisnika'.

The fields are an assumption (username, name, surname, password). The spec only asks for a simple list and form.

## Phone 375 · what changes from desktop

Heading levels are the same as on desktop. Detail views and forms are full-screen dialogs with an h2 title.

Focus order starts with 'Otvori izbornik', then the page top to bottom. The menu drawer traps focus: 'Zatvori izbornik' first, Odjava last.

Every target is at least 44 × 44 px. Inputs and main buttons are 48 px high. Nothing scrolls sideways at 320 px: cards stack, button rows stack, tags wrap.

Icon-only controls on phone: 'Otvori izbornik', 'Zatvori izbornik', 'Natrag na karte', 'Natrag na DPK', 'Zatvori obrazac i vrati se na …', 'Prethodna stranica', 'Sljedeća stranica', 'Dodaj povlaštenog korisnika', 'Dodaj kontrolora', 'Dodaj korisnika', the copy buttons, 'Prikaži PIN', 'Prikaži lozinku', 'Zatvori obavijest'.

## 03 Karte, phone

Card: the top line (plate and Detalji) is the link, 48 px high. Fields shown: Zona, Vrijedi do, Plaćanje, Fiskalizacija. Time, duration and amount are in the detail.

Focus order: Otvori izbornik, Registracija, Filteri, filter tags, Prikaži nove, cards top to bottom, pagination.

'Filteri, 1 aktivan' opens the full-screen filter drawer shown on the Components page.

Detail: 'Natrag na karte' returns to the same place in the list with filters kept.

## 04 DPK, phone

Card fields: plate, Zona, Fiskalizacija, Adresa. Failed cards add a full-width Fiskaliziraj ponovno button, named with the plate for screen readers.

The card is not one big link, so the plate link and the retry button stay separate targets.

Detail: the failure message and retry come first, then data, photos and fiscalization.

## Forms, phone

One column. Buttons stack with the primary on top; the destructive action is last and set apart.

The close button says where it goes, for example 'Zatvori obrazac i vrati se na zone'.

Boards 07 and 10 below show the two confirmation dialogs in context: deactivate an inspector, and unsaved changes. Turn their tweak off to see the form alone.

## 06 to 10, phone

Lists use the same card pattern. Each has the Stanje tweak for loading, empty and error.

Povlašteni: expired cards are tinted and carry the Isteklo chip and a red date. Tabs are 44 px high.

Izvještaji: the preview table scrolls inside its own region; export and send are full-width buttons below it.

Postavke grada: the success toast sits at the bottom, full width, below the buttons.

## Tablet 768

Navigation: a 72 px icon rail. Each icon link is named by its page. 'Proširi izbornik' opens the full menu over the page (tweak 'prosireno' on the shell board).

Karte: a table with five columns; time, duration and amount move to the detail. Filters open from the Filteri button; plate search stays on the page.

Forms: two columns. The Postavke board shows the error summary and field errors after a failed save.

Touch targets are at least 44 px: rows 52 px, inputs and buttons 48 px.
