# FlawIS

Faculty administration and participant portals for conferences, courses, and internships. The conference workflow includes submission reviews, a reusable reviewer directory, versioned questionnaires, private reviewer/author portals, and activity history.

## Repository map

| Directory | Responsibility |
| --- | --- |
| [client](client/README.md) | Next.js App Router frontend, Slovak/English portals, Base UI shadcn components, and server-side gateways |
| [core](core/README.md) | Express/Apollo GraphQL API, TypeGraphQL/TypeDI services, Typegoose/Mongoose persistence, review workflows, and notification outbox |
| [mail](mail/README.md) | Headless NestJS worker consuming RabbitMQ jobs and delivering email |
| [mongo](mongo/Dockerfile) | MongoDB 8 image with single-node `rs0` replica-set initialization |
| [scripts](scripts/verify.mjs) | Service verification, documentation reminders, and guarded staging maintenance |

Each application service owns its npm manifest and lockfile. There is no root npm workspace. Use the Node version in [.nvmrc](.nvmrc); service Dockerfiles pin the same runtime.

## Local development

Use Docker Desktop with Compose and an existing configured root `.env`. For a new checkout, copy [.env.example](.env.example) to `.env` and fill in the credentials before starting; preserve an existing `.env`. See [setup and services](docs/development.md#setup-and-services) for environment details.

```sh
nvm install
nvm use
docker compose up -d --build
```

| Local entrypoint | Address |
| --- | --- |
| Staff dashboard | <http://flawis.localhost:3000> |
| Conference participant and private-link portal | <http://conferences.localhost:3000> |
| Core GraphQL | <http://localhost:5001/graphql> |
| Mailpit inbox | <http://localhost:8025> |
| MinIO console | <http://localhost:9001> |

The local stack also runs MongoDB, Redis, and RabbitMQ. Compose routes worker email to Mailpit. It keeps application data in named volumes; refreshing container dependencies does not require deleting those volumes.

For host-side checks, install the service dependencies once with `npm ci --prefix client`, `npm ci --prefix core`, and `npm ci --prefix mail`, then run:

```sh
node scripts/verify.mjs client
node scripts/verify.mjs core
node scripts/verify.mjs mail
```

Use [the development guide](docs/development.md) for production image builds, GraphQL regeneration, dependency refreshes, and opt-in staging integration/browser checks. Core integration checks are skipped without their explicit staging configuration.

## Documentation and delivery

- [Development and verification](docs/development.md): local setup, the three Compose environments, deployment sequence, and test commands.
- [Conference reviews](docs/conference-reviews.md): coordinator/reviewer/author workflows, forms, file access, audit history, notification delivery, and rollout requirements.
- [Working with Codex](docs/agent-workflow.md): scoped helpers, documentation drift, JSDoc conventions, and plan cleanup. [AGENTS.md](AGENTS.md) is the agent instruction entrypoint.
- [Active plans](docs/plans/): unfinished work and validation. Completed plans are removed after durable guidance moves into docs.

The delivery sequence is local Docker checks → `staging` branch deployment and validation → `master` production deployment. Staging is refreshed from a production snapshot; its deployment deliberately resets RabbitMQ/Redis and cancels copied unfinished notification jobs. Ordinary restarts preserve runtime data. Production retains persistence. Follow the [delivery guide](docs/development.md#delivery-sequence) before deploying or running destructive staging scenarios.
