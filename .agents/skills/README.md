# Repository skills

Codex discovers these skills from the repository-wide `.agents/skills` directory.

- `frontend-design`: sourced from [`anthropics/skills`](https://github.com/anthropics/skills/tree/main/skills/frontend-design)
- `react-best-practices`: sourced from [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)
- `shadcn`: official `shadcn-ui/ui`, revision `8a3536678a528cc012b9e62484290e79d0be410f`. Run its CLI from `client/` and preserve the existing Base UI theme.
- `mongodb-schema-design` and `mongodb-query-optimizer`: official `mongodb/agent-skills`, revision `155bb9c4b42a9a3e019f47be0669de0e4547d1ea`. Target MongoDB 8.0 through Typegoose/Mongoose.

Keep the complete vendored directories, licenses, and referenced rule files in version control so contributors do not need matching user-level installations. These upstream manuals are separate from the project-owned [agent workflow](../../docs/agent-workflow.md) and [development guide](../../docs/development.md).

## Provenance and local changes

- Frontend design and React best practices were imported in FlawIS commit `0258902dc9fc931e93231835a66b8729d95dd49b`. Their original upstream commit IDs were not recorded; do not present that FlawIS commit as an upstream revision.
- Their unchanged `SKILL.md` snapshot SHA-256 values are respectively `1608ea77fbb6fc30d13a97d12cfa8ebf31358d40f0dd97beed24829d6b3f45dd` and `71ed7794962fa6e803ee83030517b5b93a9f70fbfeb431ec4535c5480a8d8355`. Git preserves the accompanying reference files.
- Frontend design adds `agents/openai.yaml` with `allow_implicit_invocation: false`, by project preference. Invoke it explicitly for visual-design work; ordinary maintenance preserves the existing identity.
- Shadcn uses Codex's documented `agents/openai.yaml` filename (upstream used `.yml`), a shorter UI description, and removes the unsupported upstream `user-invocable` frontmatter key. Codex's invocation policy is separate.
- MongoDB query optimizer preserves its compatibility note under `metadata.compatibility` so it passes the bundled Codex manifest validator.
- No skill bodies or reference rules are customized. Use the root/service `AGENTS.md` files for FlawIS-specific conventions.
- Keep shadcn and MongoDB pinned to the recorded revisions above. On a deliberate update, record the new upstream SHA, review the diff, preserve licenses and local metadata, and validate references. Do not refresh skills automatically during feature work.

## Discovery and duplicates

Keep repository skills at this root so they are available for cross-service work. Load only the relevant skill and references. The compiled `react-best-practices/AGENTS.md` is a reference manual, not the project's instruction entrypoint.

Duplicate user-level frontend skills can be excluded for this checkout through its trusted `.codex/config.toml`. Keep machine-specific paths in local configuration, excluded with `.git/info/exclude`, rather than committing a contributor's home directory. Confirm effective discovery after changing configuration; do not disable skills by name when that would also disable the repository copy.

The supported configuration and invocation details can vary with the Codex host/version; see [the checkout-local discovery notes](../../docs/agent-workflow.md#checkout-local-skill-discovery) before assuming local overrides have taken effect.
