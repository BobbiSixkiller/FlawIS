# FlawIS client

Next.js App Router frontend for the staff dashboard and conference, course, and internship participant portals. It uses React, TypeScript, Tailwind CSS, Base UI shadcn components, and Slovak/English localization.

## Development and checks

Use the Node version in [the root .nvmrc](../.nvmrc) (`nvm use` also works in this directory). Follow the [root README](../README.md) and [development guide](../docs/development.md) to start the Docker stack and configure its root `.env`.

For host-side tooling, run `npm ci` in this directory. From the repository root:

```sh
node scripts/verify.mjs client
node scripts/verify.mjs client --build
```

The first runs lint, typecheck, and unit/interaction tests. `--build` additionally builds the production Docker target and checks its Node runtime. Direct commands from `client/` are:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Next.js development server; needs the application environment and dependencies |
| `npm run lint` | ESLint with no warnings allowed |
| `npm run typecheck` | Generate route types, then run the configured TypeScript compiler |
| `npm test` | Node test runner through `tsx`, including React interaction tests |
| `npm run build` / `npm start` | Build / serve the production Next.js application |
| `npm run codegen` | Generate client contracts from `../core/schema.graphql` and GraphQL documents |

Compose injects the root environment; running Next.js on the host needs its own environment and reachable service endpoints. Container DNS names such as `core` and `minio` are Docker-network addresses. `API_URI` selects core GraphQL; its Docker default is `http://core:5000/graphql`.

Avoid running a production build against the development server's live `.next` directory. Use the verification wrapper's Docker build or the [isolated output mount](../docs/conference-reviews.md#validation).

## Routes and contracts

- `src/app/[lng]/flawis/` contains staff routes. `@headerActions` supplies route-specific search controls in the dashboard header. `src/proxy.ts` composes localization, authentication, and hostname-based routing for staff and participant portals.
- Conference review details use dedicated pages; reviewer management, settings, and form editing use dialogs. Reviewers/forms/review queues expose header search without additional filter controls. See [conference reviews](../docs/conference-reviews.md).
- `src/app/api/conference-review/` proxies protected review operations to core. Other API routes forward Reach webhooks and render invoice PDFs for the mail worker.
- GraphQL documents live in `src/lib/graphql/`; generated contracts live in `src/lib/graphql/generated/`. Regenerate from core rather than editing generated files. The [shared regeneration sequence](../docs/development.md#routine-verification) updates both schema files and client types.

## UI conventions

- Shared primitives live in `src/components/ui`; [components.json](components.json) configures shadcn's `base-nova` style with Base UI. Use the existing primitives and Base UI `render` composition.
- Preserve UK Sans, the university purple accent, semantic theme tokens, dark mode, labelled controls, and keyboard focus behaviour. Theme tokens live in `src/app/globals.css`; shared state variants live in `src/app/shadcn.css`.
- Shared `.prose` colours use the semantic theme tokens for both rendered rich text and the editor. Use `prose` without `dark:prose-invert` so descriptions, headings, links, lists, tables, and code follow the active theme.
- Use kebab-case filenames and PascalCase React exports. Put dashboard searches in `@headerActions`, following users/conferences. Use `GenericCombobox` with `multiple` for multi-selection and the shared multiple-file uploader for attachment inputs.
- Management forms use React Hook Form/Zod, field errors inside dialogs, guarded dirty dismissal, retained input after failure, and focus restoration. Keep action state scoped to the submission/assignment.
- Localize new copy in Slovak and English. Client checks support the interface; core enforces authorization and workflow prerequisites.

The package manifest and lockfile are the dependency source of truth. `@typescript/native` supplies the TypeScript 7 compiler for typechecking; the `typescript` alias supplies the TypeScript 6 JavaScript API used by dependent tools. Codegen uses explicit scalar mappings and native enums in [codegen.yml](codegen.yml). Review dependency changes with the relevant checks rather than forcing automatic major-version audit fixes.

## Browser checks

Playwright targets the university staging dashboard. The suite includes public login checks and authenticated reviewer/form/conference navigation checks in both languages at desktop/mobile sizes. Protected pages require a locally saved login; conference checks also need `E2E_CONFERENCE_SLUG`.

Use the [staging browser instructions](../docs/development.md#staging-browser-checks) for browser installation, `npm run test:browser:login`, and `npm run test:browser`. Authentication files, traces, screenshots, and reports stay untracked. The maintained smoke suite does not save valid forms or send notifications.
