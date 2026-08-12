# Project TODO

## Phase 02 — Database Schema & Core Content Domain

- [ ] Continue Supabase migrations after Phase 01 and add lookup tables.
- [ ] Add normalized movies, series, seasons, episodes, people, cast, crew, collections, and junction tables.
- [ ] Add shared content lifecycle constraints, foreign keys, indexes, and published-content FTS indexes.
- [ ] Add RLS to all content tables with published-only public reads and admin-only writes.
- [ ] Add server-only typed content services with Zod pagination and slug validation.
- [ ] Add shared content domain types and generated Supabase database types.
- [ ] Add `pnpm gen:types` and `pnpm db:seed` scripts.
- [ ] Add local seed data with bilingual lookup values, published movies, and a published series with episodes.
- [ ] Add RLS verification SQL and Vitest service-query tests.
- [ ] Update README with content domain, lifecycle, RLS, and seed instructions.
- [ ] Run lint, typecheck, build, and Vitest; fix failures.
- [ ] Review the final diff and mark only verified work as complete.
