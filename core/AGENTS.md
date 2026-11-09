# Core conventions

- Core uses Express/Apollo, TypeGraphQL, TypeDI, and Typegoose/Mongoose; it is not a NestJS application.
- Follow the existing resolver/service/repository boundaries. Preserve the existing `entitites/` path spelling unless a task explicitly covers renaming it.
- Enforce access control and workflow prerequisites server-side, including conference/section scope, author conflicts, and private-link validity.
- Apply authorization and search filters before pagination. Avoid exposing confidential report data in queue summaries.
- Changes that require atomic audit evidence must persist both the mutation and audit event in the same MongoDB transaction.
- Preserve immutable form versions, answer history, and the version pinned to an existing review round.
- Preserve durable notification/outbox semantics and distinguish queued, sent, failed, and uncertain delivery.
- Use MongoDB skills for relevant modelling/performance work through the existing repositories; Atlas or MCP is not required for routine development.
- For GraphQL contract changes, run `npm run schema --prefix core`, then `npm run codegen --prefix client` and client typecheck. Both schema files and generated client contracts belong in the change.

## Validation

- `node scripts/verify.mjs core` builds and runs unit tests. Integration tests are explicitly opt-in.
- `node scripts/verify.mjs core --integration` uses existing staging services through explicit staging environment variables; see `docs/development.md`.
- Integration fixtures reset only `flawis_reviews_test` and `flawis_notifications_test`. Transport tests use the separate `flawis-review-tests` vhost, so the running mail worker cannot consume fixture messages.
- Destructive application scenarios may use the staging snapshot as a deliberate test step. Restore affected data afterwards; never target production or normal development data.
- Broker restarts are optional and interrupt shared staging. Retain endpoint and Compose-label checks, and distinguish transport-only verification from restart durability checks.
