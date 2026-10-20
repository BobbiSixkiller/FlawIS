# FlawIS client

Next.js App Router frontend for the faculty administration and participant portals.

## Development

Use Node 24.22 (`nvm use` in this directory), then install from the lockfile:

```sh
npm ci
npm run dev
```

The application uses the repository's existing environment variables, GraphQL service, and MinIO service. See the root README for the full service setup.

```sh
npm run codegen   # Generate GraphQL types from ../core/schema.graphql
npm run lint
npm run typecheck
npm test
npm run build
```

## UI conventions

- Shared primitives live in `src/components/ui`. They use shadcn's `base-nova` style with Base UI, configured in `components.json`. Use Base UI's `render` prop to compose triggers with links or buttons.
- Import basic controls directly from `@/components/ui/*`; avoid pass-through wrapper components. Connect checkboxes with `checked` and `onCheckedChange`, and use `password-input` for password visibility controls. Keep application components for behavior such as async searches, form option mapping, and dialog state. Import `cn` from `@/lib/utils` in new components.
- Component filenames use kebab-case, including components beside route pages and editor helpers (for example, `dashboard-header.tsx` and `login-form.tsx`). React component exports remain PascalCase. Route directory names are unchanged.
- `Dashboard` follows UFD's admin shell: `SidebarProvider`, `AppSidebar`, `SidebarInset`, and a separate header with the navigation trigger, breadcrumbs, and account actions. Sidebar state persists in a cookie; navigation becomes a sheet on mobile.
- Theme tokens in `src/app/globals.css` define light/dark surfaces, faculty plum, typography, focus rings, and spacing. Prefer semantic classes such as `bg-card`, `text-muted-foreground`, and `border-input` over independent gray palettes. Preserve the university's UK Sans and branding.
- `src/app/shadcn.css` contains the shared shadcn state variants. The shadcn generator is a development CLI, not an application runtime dependency; run it with `npx shadcn@latest` when adding primitives.
- Keep controls labelled, keyboard operable, and usable with reduced motion. Dialogs, menus, selects, and comboboxes delegate focus and dismissal to Base UI.

## Dependency compatibility

The October 2026 refresh updates the application dependencies to their current stable releases. ESLint stays on the latest 9.x release because the current Next.js React, import, and accessibility plugins do not support ESLint 10 yet.

TypeScript 7 supplies the native compiler through the `@typescript/native` alias. The `typescript` package points to Microsoft's TypeScript 6 compatibility package for tools that use the JavaScript compiler API. This follows the [TypeScript 7 migration guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).

GraphQL Codegen 6 uses explicit scalar mappings and native enums in `codegen.yml`. UI data types come from selected fragments rather than complete schema objects, following the [Codegen migration guidance](https://the-guild.dev/graphql/codegen/docs/migration/operations-and-client-preset-from-5-0).

`npm audit` still reports upstream transitive advisories in the code generation, typography, and MinIO dependency trees. Do not use `npm audit fix --force` to downgrade these direct dependencies; review upstream fixes and verify their compatibility first.
