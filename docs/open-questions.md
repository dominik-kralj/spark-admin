# Open questions

Questions for the user or the backend team. Remove an entry once it is answered,
and put the answer in the code, `api-assumptions.md` or `AGENTS.md`. Questions
already in `SPARK-feature-docs.md` §5 are referenced by number there, not copied.

| #   | Question                                                                                                                                                                                                                                | For     | Blocks |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ |
| 1   | OIB: validate only "11 digits", or also the ISO 7064 MOD 11,10 checksum?                                                                                                                                                                | user    | M3     |
| 2   | Admin users: no table or login flow (§5.12). Which fields does Korisnici edit?                                                                                                                                                          | backend | M1, M6 |
| 3   | Izvještaji: real report types and their parameters.                                                                                                                                                                                     | user    | M6     |
| 4   | Feature docs say Admin targets "desktop and tablet"; handoff says from 320 px. Building to 320 px per handoff. Confirm.                                                                                                                 | user    | -      |
| 5   | Error bodies: ProblemDetails? For 400, field errors keyed how (camelCase property names)? Only the status is read today.                                                                                                                | backend | M2     |
| 6   | Admin login: does the request need a `tenantId` (the Inspector one sends it), or does the user or API key decide the city?                                                                                                              | backend | M1     |
| 7   | Admin login: does the response carry the token's expiry, or must the frontend decode the JWT `exp`?                                                                                                                                     | backend | M1     |
| 8   | Login: the design has no show/hide password button ("Icon-only controls: none"; focus order username, password, Prijava), issue #4 asks for one. Built per the issue, between Lozinka and Prijava, styled like the PIN toggle. Confirm. | user    | -      |
| 9   | Login validates on submit, not on blur as components.md asks, so an error appearing on blur can't move the field the user is about to click. Longer forms keep blur validation. Confirm.                                                | user    | -      |
