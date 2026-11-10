# FlawIS development

## Project map

- `client/`: Next.js App Router, React, Base UI shadcn components. Read `client/AGENTS.md` when changing frontend code or browser tests.
- `core/`: Express/Apollo, TypeGraphQL, Typegoose/Mongoose. Read `core/AGENTS.md` for API, persistence, or integration tests.
- `mail/`: NestJS RabbitMQ worker. Read `mail/AGENTS.md` for messaging and email changes.
- Each service owns its npm manifest and lockfile; there is no root npm workspace. Use npm and the Node version in `.nvmrc`.

## Working agreements

- Inspect a nearby implementation before introducing a new abstraction or UI pattern.
- Carry authorized changes through relevant validation; fix failures caused by the change and report unrelated failures separately.
- Preserve unrelated working-tree changes. Do not reset normal development or production data to make a test pass.
- Run and repair authorized checks without asking for permission at each step.
- Use skills when they help the task. Read their detailed references selectively; do not reload unchanged manuals on every edit.
- Keep instructions about stable project conventions here; keep feature behaviour in `docs/` and code.
- For multi-step work, keep one concise active plan in `docs/plans/` with decisions, acceptance checks, progress, and outstanding work. Small fixes need no plan file. Before closing a completed plan, move durable behaviour/operations into the relevant `docs/` page, preserve unresolved checks in an active follow-up, fix references, then delete the completed plan. Git retains committed history; never delete the only record of unfinished work.
- Report what changed, the checks actually run, and any remaining limitation. A skipped test is not a passing test.

## Delegation and context

- Use a single agent for small fixes and simple searches. Delegate a bounded, independent multi-file lookup to `explorer` when that avoids a substantial context dump; use `doc_drift` for a scoped factual documentation audit. This is authorization for those read-only tasks, not an instruction to spawn agents on every turn.
- Both project roles in `.codex/agents/` pin `gpt-6-luna`: `low` effort for lookup, `medium` for documentation claims. Keep architecture, implementation, security judgments, and final review with the primary agent. Do not globally downgrade all subagents.
- If the host exposes only direct spawning, explicitly select `gpt-6-luna`, use the role's effort/instructions, and set `fork_turns="none"`. Give an exact question, paths, breadth/stop condition, and concise evidence format. Do not copy the conversation or unrelated manuals into the brief.
- Start with one helper; use two only for independent scopes. Helpers must not edit, run builds/tests, read secrets, or delegate further. Verify their decisive evidence before acting. Reuse the helper for clarification; escalate uncertainty to the primary agent instead of repeating broad audits. If the model is unavailable, do the lookup directly and report the fallback.
- Configuration details, limitations, and known-answer smoke checks are in `docs/agent-workflow.md`; read them when changing the agent setup.

## Documentation and comments

- Update affected documentation and comments with the behaviour change. Run `node scripts/docs-drift.mjs` before closing multi-step work; it lists potentially affected docs, not proven errors. Use `--staged` for an index-only check or `--base <ref>` for changes since a branch point. Review only the relevant claims; do not rewrite unrelated prose to silence a reminder.
- Add concise JSDoc to new or changed shared APIs, service boundaries, and exported utilities when callers need a contract: purpose, permissions, invariants, side effects, failure or retry behaviour. Document non-obvious component props; ordinary self-explanatory exports/props do not need ceremonial comments. No repository-wide comment backfill.
- Let TypeScript carry types. Use `@param`, `@returns`, `@throws`, `@example`, `@deprecated`, and `@see` only when they add information. Use inline comments for non-obvious reasons, not line-by-line narration. Keep comments present-tense and brief; put long rationale in domain docs and link it. Git holds change history. Remove stale comments when editing the code they describe.
- Check current claims against code/configuration; preserve explicitly historical verification records. Document skipped checks honestly. See `docs/agent-workflow.md` for the maintenance workflow.

## Development and delivery

- The normal sequence is local Docker build and checks, merge/push to `staging`, GitHub Actions deployment, verification on staging, then promotion to `master` for production.
- For remote diagnosis, read `.agents/local/deployment.md` if present before asking for connection details. Keep host addresses, SSH accounts, and access instructions in ignored local notes or a private operations runbook, not public documentation. The local Docker context is not the deployment host.
- Keep the three existing Compose files for local, staging, and production. Use staging for integration and destructive workflow testing; do not add a separate test stack.
- Staging is shared with university staff. Destructive checks are an explicit test step, with a snapshot refresh afterwards when needed. Default browser smoke checks preserve records and send no notifications.
- Each staging deployment resets only its RabbitMQ/Redis volumes, cancels copied unfinished notification jobs after the MongoDB restore, and recreates broker credentials/vhosts before starting the application. Normal restarts retain runtime data. Production retains persistence.
- Snapshot refreshes may leave extra database collections or stored objects. Clean up scenario leftovers explicitly; a snapshot refresh cannot undo sent emails.
- Run integration fixtures in their dedicated databases and RabbitMQ vhost on the existing staging services, as documented. Broker restarts require the explicit test flag because they interrupt staging delivery.
- A request to edit or validate locally does not itself request a branch merge, push, or production deployment. Follow the scope of the current request.
- Use `docs/development.md` for commands, test targets, and deployment verification. Use `docs/conference-reviews.md` when changing review workflow rules.
- Validate in proportion to the change: focused checks for small fixes; affected service suites and builds for runtime changes; relevant integration/browser checks for fullstack workflows.
- Avoid concurrent production builds against the running development client's `.next`; use an isolated output mount as documented.

## Skills

- Repository skills live in `.agents/skills`; sources and local customizations are recorded in its README.
- Prefer repository copies when a user-level copy of the same skill also appears in the session catalog.
- `shadcn`: UI component work; run its CLI from `client/` and use the existing Base UI configuration.
- `vercel-react-best-practices`: relevant React/Next.js implementation and refactoring rules.
- `frontend-design`: explicitly requested visual-design work; preserve the established FlawIS identity unless the user requests a change.
- `mongodb-schema-design`: data-model and schema decisions through Typegoose/Mongoose on MongoDB 8.
- `mongodb-query-optimizer`: explicit performance/index investigations, not routine query authoring.
- Do not install more skills merely to cover every library. Add one when it addresses a recurring workflow or a demonstrated gap.
