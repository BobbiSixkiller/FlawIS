# FlawIS core

Express/Apollo GraphQL service for users, conferences and submissions, courses and attendance, internships, invoices, reusable forms, and conference review workflows. TypeGraphQL defines the API, TypeDI supplies services, and Typegoose/Mongoose persists data in MongoDB. Core also exposes protected review/file/notification endpoints and the Reach webhook receiver. The public `GET /conference-templates/:conference/manuscript` endpoint serves only the current published manuscript template; template management and review files remain protected. See [conference templates](../docs/conference-reviews.md#conference-templates).

## Development and checks

Follow the [root setup](../README.md) and [development guide](../docs/development.md). Use the Node version in [../.nvmrc](../.nvmrc) and `npm ci` in this directory for host-side tooling. Compose injects the root `.env`; a host process needs the same settings exported with endpoints reachable from the host.

The process listens on `PORT` (default `5000`), with GraphQL at `/graphql`. Local Compose publishes it as <http://localhost:5001/graphql>.

| Command from `core/` | Purpose |
| --- | --- |
| `npm run dev` | Nodemon/ts-node development process |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm run serve` | Run the compiled service |
| `npm test` | Build, then run Node tests; review integration suites require explicit opt-in settings |
| `npm run schema` | Build and regenerate `schema.graphql` and `schema.gql` |

From the repository root, prefer `node scripts/verify.mjs core`. It clears inherited integration opt-ins. Add `--build` for a production Docker image/runtime check. Use [staging integration instructions](../docs/development.md#staging-integration-tests) for `--integration`; those fixtures use dedicated databases and a separate RabbitMQ vhost on existing staging services.

## Code and configuration

| Path | Responsibility |
| --- | --- |
| `src/resolvers/` | GraphQL entrypoints and input/output contracts |
| `src/services/` | Domain behaviour and external integrations |
| `src/repositories/` | Persistence access |
| `src/entitites/` | Typegoose models; the existing directory spelling is intentional here |
| `src/routes/` | Reach webhooks and protected review/file/notification HTTP routes |
| `src/middlewares/` | GraphQL error handling, model conversion, and activity recording |
| `scripts/` | Schema generation and the explicit unused-course migration tool |

Core needs `MONGODB_URI`, Redis (`REDIS_URI`, default `redis://redis:6379`), MinIO settings, RabbitMQ settings, and the application secret. [../.env.example](../.env.example) is the shared starting point. MongoDB must support transactions: the local Mongo image initializes the `rs0` replica set. Use the shared `RMQ_EXCHANGE` with the mail worker; the durable default is `FlawIS.notifications.v2`.

Review permissions, version-pinned forms, file access, activity history, outbox delivery, and migration requirements are documented in [conference reviews](../docs/conference-reviews.md). Update the schema and generated client contracts together when changing GraphQL. `npm run schema` generates artifacts without starting the application server.

`npm run reset:courses` is a one-time migration tool, not routine setup or a test command. It requires an explicit environment and database, defaults to a dry run, and performs deletion only with `--apply`. Follow the [migration instructions](../docs/conference-reviews.md#one-time-reset-of-unused-courses) for a deployment that still needs the original shared-form transition.

## Reach 360 integration

Core reads these integration settings:

| Variable | Purpose |
| --- | --- |
| `REACH_API_BASE_URL` | Reach API origin; code defaults to `https://api.reach360.eu` |
| `REACH_API_KEY` | API credential for course learner/enrollment operations |
| `REACH_WEBHOOK_SECRET` | Shared secret for verifying incoming webhook signatures |

The public Next.js endpoint is `https://<frontend-host>/api/integrations/reach/webhooks`. Its `REACH_WEBHOOK_UPSTREAM_URL` must point to core's `/integrations/reach/webhooks` endpoint; local Compose sets `http://core:5000/integrations/reach/webhooks`. The gateway forwards the raw body and signature. Core verifies `x-hook-signature` against the configured secret and processes `user.created` events. Missing configuration and invalid signatures are rejected.

Configure the external webhook with the same shared secret. Course e-learning settings use the published Reach course ID and its learner-facing direct link. Course data reset preserves external Reach resources; it does not remove them from Reach.
