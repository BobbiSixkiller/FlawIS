# Client conventions

- Preserve UK Sans, the purple accent, semantic theme tokens, and light/dark support. Use the existing Base UI shadcn primitives in `src/components/ui`.
- Inspect users/conferences pages for established navigation and search patterns. Dashboard search belongs in the `@headerActions` parallel route; ensure fallback routes clear stale actions on navigation.
- Reviewers, forms, and submission reviews currently use search only. Do not add filters to those pages without a task requiring them.
- Use `GenericCombobox` with `multiple` for multi-selection and the shared multiple-file uploader for attachment inputs. Preserve configured file-count limits across previews and live forms.
- Management tasks use focused dialogs; submission details and reviewer/author questionnaires use dedicated pages.
- Management forms use React Hook Form and Zod with validation inside the active dialog, retained values on failure, guarded dirty dismissal, and focus restoration.
- Keep action state scoped to its submission/assignment. Preserve queue navigation context through URL state.
- Localize new user-facing copy in Slovak and English using the neighbouring translation approach.
- Treat client-side checks as UX only; authorization and workflow prerequisites belong in core.
- Edit GraphQL documents and regenerate contracts; do not hand-edit `src/lib/graphql/generated`.
- Read the relevant React/shadcn rules, not their entire reference collections, for each task.

## Validation

- `node scripts/verify.mjs client` from the repository root runs lint, typecheck, and unit/interaction tests. Use existing test-runner options for a focused test while iterating.
- Add `--build` for a production build, or use the documented Docker build workflow.
- Browser tests under `e2e/` target staging by default. Read `docs/development.md` before running them; credentials, auth state, traces, and reports stay untracked.
- Cover keyboard focus, mobile scrolling, and both languages for interaction changes. Assert user-visible behaviour rather than implementation details.
- Avoid backend rebuilds for isolated cosmetic changes unless evidence warrants them.
