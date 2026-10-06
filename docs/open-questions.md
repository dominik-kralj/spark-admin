# Open questions

Questions for the user or the backend team. Remove an entry once it is answered,
and put the answer in the code, `api-assumptions.md` or `AGENTS.md`. Questions
already in `SPARK-feature-docs.md` §5 are referenced by number there, not copied.

| #   | Question                                                                                                                 | For     | Blocks |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------- | ------ |
| 1   | OIB: validate only "11 digits", or also the ISO 7064 MOD 11,10 checksum?                                                 | user    | M3     |
| 2   | Admin users: no table or login flow (§5.12). Which fields does Korisnici edit?                                           | backend | M1, M6 |
| 3   | Izvještaji: real report types and their parameters.                                                                      | user    | M6     |
| 4   | Feature docs say Admin targets "desktop and tablet"; handoff says from 320 px. Building to 320 px per handoff. Confirm.  | user    | -      |
| 5   | Error bodies: ProblemDetails? For 400, field errors keyed how (camelCase property names)? Only the status is read today. | backend | M2     |
