# Working with Codex

Root and service `AGENTS.md` files hold stable instructions. Read only the service guidance, skills, and domain documents relevant to the task. [Development commands](development.md) describe validation and delivery; [conference reviews](conference-reviews.md) describes feature behaviour. Skill provenance belongs in [.agents/skills/README.md](../.agents/skills/README.md).

## Plans end; useful documentation stays

Use one short `docs/plans/<task>.md` for multi-step work. Keep decisions, acceptance checks, progress, and unresolved work current at meaningful milestones. Small fixes need no plan.

When implementation and its required checks finish:

1. Put durable behaviour, contracts, operational steps, and useful limitations in the relevant domain document. Extend an existing document before creating another. Do not copy the full task log.
2. Preserve remaining work in an active plan if a deployment, authenticated check, or other required validation is still pending. State what ran, what did not, and the prerequisite for resuming. A passing local check does not complete a pending staging check.
3. Replace links to the completed plan with stable documentation, then delete the plan in the same change. Git preserves committed history; material in an uncommitted plan must be moved before deletion.

`docs/plans/` is an active work list, not an archive. Keep an unfinished plan instead of repeatedly creating overlapping follow-ups. Deleting a plan never authorizes a deployment or turns a skipped check into a pass.

## Small, scoped helpers

The project defines two read-only roles in `.codex/agents/`:

| Role | Work | Reasoning |
| --- | --- | --- |
| `explorer` | Locate files, symbols, and call sites in a named scope | Low |
| `doc_drift` | Verify specified factual documentation claims against code/configuration | Medium |

Both role files pin `gpt-6-luna`, available in the updated local CLI and this Work session. The primary agent keeps implementation, architectural choices, security judgments, and final review. No global model downgrade is configured. See [Codex custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents) for role discovery and model precedence.

The standalone CLI was updated from 0.147.0 to 0.167.0 on 2026-11-09 with `codex update`. Its refreshed `codex debug models` catalog includes `gpt-6.1-sol`, `gpt-6.1-terra`, `gpt-6-astra`, and `gpt-6-luna`. The existing user default remains `gpt-6.1-sol` at `xhigh`; the project helper pins remain low/medium as above. Restart running CLI sessions after updating. For subsequent upgrades, use `codex update`, verify `codex --version`, refresh the catalog, and run the bounded role checks below before changing pins.

The role files are versioned. For clients requiring explicit role registration, merge [.codex/config.example.toml](../.codex/config.example.toml) into the checkout's `.codex/config.toml`; copy it only when no local config exists. Preserve existing skill exclusions. Keep that machine-specific file out of Git with a `/.codex/config.toml` entry in `.git/info/exclude`. This checkout already has the role registrations and Git exclusion; strict CLI `config/read` resolves both role file paths correctly. No global configuration was changed.

Use a helper when an independent multi-file read would otherwise fill the main context. A simple `rg` lookup or one-file edit usually costs less without delegation. Start with one helper; two are appropriate only for independent scopes. Reuse a helper for a clarification instead of starting a review chain.

Supply a self-contained question, exact paths, expected breadth, stop condition, and short output limit. Prefer no inherited conversation (`fork_turns="none"` in hosts that expose it). Require `path:line` evidence and explicit uncertainty; inspect decisive evidence before editing. Helpers do not write, run builds/tests, read secrets, or spawn more agents. These are behavioural restrictions: custom roles inherit the parent's permissions and do not establish a separate read-only sandbox.

Hosts that expose only direct spawning need an explicit model/effort and the role's instructions in the brief. If the requested model is unavailable, the primary agent should handle the narrow read directly and disclose the fallback. Recheck model availability and role discovery after changing Codex clients or upgrading. New role/configuration discovery may require a fresh session.

Smaller models and narrow briefs can reduce overhead; delegation itself adds work. No subscription savings percentage is assumed. Validate useful answers before extending the cheaper roles to more difficult tasks. Do not introduce usage logging, extra skills, mandatory agent pipelines, or hooks without a demonstrated need.

### Known-answer checks

When changing role instructions or model pins, give these questions without the expected answer to a helper, then compare its evidence:

- Lookup: which environment variable selects the notification exchange in core and mail, and what default does each consumer use? Expected: `RMQ_EXCHANGE`, default `FlawIS.notifications.v2`, supported by both consumers; distinguish the derived dead-letter exchange.
- Drift: assess “core runs on NestJS”, “ordinary staging restarts clear RabbitMQ volumes”, and “the mail service uses NestJS”. Expected: false, false, true. Demand code/workflow references, not agreement with documentation alone.

A failed or inconclusive check returns the task to the primary agent. This is a bounded smoke check, not evidence that a small model can review security or design changes reliably.

Initial verification on 2026-11-09 with CLI 0.147.0: strict configuration resolved both registered roles, and an ephemeral read-only CLI run successfully spawned the then-configured `explorer` on `gpt-5.6-luna` without a model override and located `RMQ_EXCHANGE` and its default in both consumers. A direct-spawn `gpt-6-luna` helper at medium effort correctly assessed all three drift claims with implementation evidence. The CLI `doc_drift` role's configuration was checked, but its own end-to-end invocation was not run at that point. The 17 helper tests passed, including staged/untracked/deleted/renamed paths and merge-base comparisons; local documentation links passed validation. These are setup checks, not application or staging validation.

After the 0.167.0 upgrade on the same date, strict configuration again resolved both roles and the existing `gpt-6.1-sol`/`xhigh` default. An ephemeral read-only CLI smoke check invoked both named roles sequentially without child model/effort overrides. Explorer returned the correct variable, default, and derived `.dead` exchange; doc drift correctly assessed all three claims with implementation references. Both role files use `gpt-6-luna`, and their low/medium efforts are supported by the refreshed catalog. TOML, documentation links, and whitespace checks passed; application suites were not rerun for this CLI/configuration-only update.

## Documentation drift without a mandatory audit

Run the dependency-free reminder from the repository root before closing multi-step work:

```sh
node scripts/docs-drift.mjs
node scripts/docs-drift.mjs --staged
node scripts/docs-drift.mjs --base origin/staging
```

The default includes tracked changes since `HEAD` and untracked files, excluding ignored files. `--staged` checks only the index. `--base` includes committed and working-tree changes since the merge base with that reference. Renames include both paths so removed ownership is visible. The base must already exist locally; the command does not fetch.

The small ownership map in `scripts/docs-drift.mjs` points deployment/runtime/test changes to `development.md`, review/form/notification changes to `conference-reviews.md`, and agent setup changes to this document. Runtime/service manifests also flag the root README; service entrypoints, configuration, and tooling flag their owning service README. Extend that map when a durable document gains a new area of responsibility. Generated contracts and vendored skill reference bodies do not independently trigger reviews.

This is an advisory path check, not a semantic validator or coverage guarantee. A changed document is still listed: editing prose does not prove correctness. No match does not prove that all docs are current. Exit status is zero for reminders and nonzero for invalid arguments or Git failures. There is no Stop hook, frontmatter requirement, or CI gate.

Inspect affected claims directly. For a substantial multi-file factual audit, use `doc_drift` with only the relevant document sections and implementation paths. Verify commands, flags, defaults, permissions, lifecycle claims, and links. Do not execute destructive documented commands to check their spelling. Report contradictions with evidence; distinguish uncertainty and historical results from current behaviour. Update the docs with the code, or record that the relevant claims were checked and remain accurate in the handoff; no cosmetic edit is necessary.

## Useful JSDoc and comments

Use short JSDoc for shared API/service contracts and exported utilities when callers need more than the signature: permissions, transaction boundaries, side effects, failure semantics, retry/idempotency rules, or units and ordering. Explain unusual component props, not every obvious `label` or `disabled` prop. Apply this when touching a contract; no bulk comment backfill is required.

Lead with purpose. TypeScript owns types, so avoid duplicated `{Type}` tags. Add `@param`, `@returns`, `@throws`, `@example`, `@deprecated`, or `@see` only when they convey useful information. Inline comments explain non-obvious reasons or constraints. Keep prose brief and present-tense; longer rationale belongs in the domain document with a link from the code. Do not add dated bug narratives or restate the implementation. Update or remove comments when their claims stop being true.

## Checkout-local skill discovery

Machine-specific skill exclusions belong in the trusted checkout's ignored `.codex/config.toml`, not versioned home-directory paths. The versioned role files are separate from that local configuration. Prefer repository skills when a duplicate user-level skill appears.

On 2026-11-10, at the user's request, the user-level `frontend-design` and `vercel-react-best-practices` skill directories were moved to Trash, retaining recoverable copies. Their stale checkout-local exclusions were removed while preserving agent registrations. A fresh CLI 0.167.0 process with `skills/list` and `forceReload: true` found exactly one enabled repository copy of each in FlawIS and neither skill in user-level discovery outside the repository, with no discovery errors. The three other user skills and five bundled system skills remained available. This resolves the local duplication through removal; it does not establish that the earlier exclusion issue is fixed. An existing app session may retain its previous catalog; reopen the session if stale entries remain.

Verification on 2026-11-09 with Codex CLI 0.147.0: `config/read` reported checkout-local duplicate exclusions as effective, but pre-thread `skills/list` still reported the global copies enabled. Equivalent CLI overrides disabled them correctly. At that point, duplicate-free discovery in a fresh app session was unverified. All five repository skills passed the bundled manifest validator, and the shadcn/frontend-design metadata was recognized.

Rechecking pre-thread discovery after upgrading to 0.167.0 still listed both repository and global frontend skill copies as enabled, with no discovery errors. The upgrade did not resolve that configuration limitation.

A fresh app session on 2026-11-10, before removal, confirmed that both repository and user-level `vercel-react-best-practices` entries remained in the supplied skill catalog. The checkout-local exclusions pointed to existing user-level `SKILL.md` files with `enabled = false`, but the host still exposed the duplicate React entry. Fresh-session discovery was checked; duplicate-free discovery had not been achieved. No skill or user-wide configuration was changed during that check.

| Project skill | Entries visible in the fresh session's catalog before removal |
| --- | --- |
| `vercel-react-best-practices` | Repository and user copies |
| `shadcn` | Repository copy |
| `mongodb-schema-design` | Repository copy |
| `mongodb-query-optimizer` | Repository copy |
| `frontend-design` | User copy; repository copy is absent from the supplied catalog and has `allow_implicit_invocation: false` in its metadata |

[OpenAI's skill guidance](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) explains that equal-name skills remain separate and may both appear in selectors. Its enablement guidance uses file-specific path selectors; a name selector would also match the repository copy.
