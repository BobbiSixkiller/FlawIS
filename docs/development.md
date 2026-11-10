# Developing and verifying FlawIS

Start with the [repository overview](../README.md). Service-specific structure and commands are in the [client](../client/README.md), [core](../core/README.md), and [mail](../mail/README.md) READMEs.

## Setup and services

Use the Node version recorded in `.nvmrc` and npm. Each service has its own lockfile; there is no root npm workspace.

```sh
nvm install
nvm use
npm ci --prefix client
npm ci --prefix core
npm ci --prefix mail
```

Use the existing local `.env` for normal Docker development. Copy `.env.example` only when setting up a new checkout; do not replace an existing `.env` or commit secrets.

Compose injects the root `.env` into application containers. Running a service directly from its own directory does not automatically load that root file; configure the host process environment separately. Docker hostnames such as `core`, `mongo`, `minio`, `rabbitmq`, and `redis` resolve inside the Compose network. Host tools need the published ports instead.

| Setting | Local setup |
| --- | --- |
| `MONGODB_URI` | The example targets database `flawis` on `mongo:27017` with replica set `rs0`; the Mongo image initializes that replica set |
| `REDIS_URI` | Core defaults to `redis://redis:6379` when unset |
| `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` | Use `minio` inside Compose and credentials matching the local MinIO account configured in `docker-compose.yml` |
| `SECRET`, `NOTIFICATION_SECRET` | Shared application/internal credentials; notification encryption falls back to `SECRET` when no dedicated secret is set |
| `API_URI`, `CORE_INTERNAL_URL`, `CLIENT_INTERNAL_URL` | Internal GraphQL, delivery, and PDF-render addresses; local Compose supplies the service addresses |
| `RMQ_URI`, `RMQ_EXCHANGE` | Connect core/mail to the same broker and durable exchange, default `FlawIS.notifications.v2` |
| `MAIL_FROM` | Sender for local captured messages; Compose overrides SMTP host/port to Mailpit and clears SMTP authentication |
| `GOOGLE_*`, `REACH_*` | Configure when using Google sign-in or the [Reach integration](../core/README.md#reach-360-integration) |

`INVOICE_RENDER_SECRET` optionally separates mail/client PDF-render authentication from `SECRET`. Keep shared secrets consistent across their consumers and preserve deployed notification secrets for existing encrypted jobs. Placeholder credentials in `.env.example` are not production configuration.

```sh
docker compose up -d --build
```

The admin UI is at `http://flawis.localhost:3000` (plain `http://localhost:3000` also maps to the staff tenant), the conference tenant at `http://conferences.localhost:3000`, core GraphQL at `http://localhost:5001/graphql`, local Mailpit at `http://localhost:8025`, and the MinIO console at `http://localhost:9001`. The remaining local ports are MongoDB `27017`, RabbitMQ AMQP `5672`, Redis `6379`, and MinIO API `9000`.

`client/` is Next.js/React/Base UI. `core/` is Express/Apollo/TypeGraphQL with Typegoose/Mongoose on MongoDB 8. `mail/` is a headless NestJS RabbitMQ worker.

After dependency or Node-image upgrades, refresh the anonymous dependency volumes as well as the images:

```sh
docker compose up -d --build --renew-anon-volumes
```

This refreshes container `node_modules` while preserving named database, broker, Redis, MinIO, and Mailpit volumes. A local startup does not run the staging snapshot/reset workflow. The local Mongo service sets `GLIBC_TUNABLES=glibc.pthread.rseq=1` for the documented Docker Desktop/MongoDB compatibility workaround in Compose.

## Delivery sequence

1. Implement and build locally with Docker Desktop. Run checks appropriate to the changed services.
2. When deploying the change, merge/push to `staging`. `.github/workflows/staging.yml` builds and deploys it on the university runner.
3. Verify at `https://flawis-staging.flaw.uniba.sk` and, for public conference flows, `https://conferences-staging.flaw.uniba.sk`.
4. After staging verification, promote to `master` for the production workflow. The production dashboard is `https://flawis.flaw.uniba.sk`.

Keep only the existing `docker-compose.yml`, `docker-compose.staging.yml`, and `docker-compose.prod.yml`. Staging is the integration and destructive-testing environment; no fourth Compose file or local test stack is needed. Local verification does not automatically merge/push branches or deploy.

Staging is shared with a small staff group. Run destructive scenarios as a deliberate testing step and refresh the snapshot afterwards when needed. The workflow restores production MongoDB collections with `mongorestore --drop` and mirrors MinIO objects. Staging-only MongoDB collections and extra MinIO objects still need explicit cleanup; the restore does not remove them.

### Remote diagnosis

Use the approved SSH connection and required network access recorded in the private operations runbook or this checkout's ignored `.agents/local/deployment.md`. Do not commit host/account details, access notes, passwords, or private keys to this public repository.

Run remote Docker inspection inside the SSH session; the laptop's default Docker context is Docker Desktop. Identify the target by Compose project labels (`flawis-staging` for staging) before making changes on the shared host. SSH access does not itself authorize production changes or a deployment.

For staging broker diagnosis, read `docker logs --tail 100 flawis-staging-rabbitmq-1` and `docker inspect --format '{{json .State}}' flawis-staging-rabbitmq-1`. These inspect startup and health-check failures without dumping container environment variables. Review diagnostic output before sharing it publicly.

### Runtime reset on each staging deployment

The staging workflow uses `scripts/staging-runtime.mjs` to perform these steps, with application services stopped until preparation succeeds:

1. Validate that application endpoints use the staging Compose services (`rabbitmq:5672` and `redis:6379`) and that the configured runtime volumes have the expected names.
2. Stop the staging Compose project and remove only `flawis-staging_rabbitmq_data_staging` and `flawis_staging_redis_data`. Check volume ownership first; the previous workflow's unlabeled, explicitly named Redis volume is also supported. MongoDB/MinIO volumes and production resources are preserved.
3. Restore MongoDB, then mark copied `PENDING`, `QUEUED`, and `SENDING` notification jobs as `CANCELLED`, retaining their payload/history and clearing retry/lease fields. Refuse cancellation while staging application services are running.
4. Build images, start RabbitMQ/Redis, and wait for health checks. Import the application account, its vhost, and `flawis-review-tests` from the existing `RMQ_URI`. Its credentials also grant access to the test vhost. Password hashes are passed through stdin without logging credentials or writing credential files.
5. Start the application only after cancellation and broker initialization succeed. A failed reset/preparation stops the deployment; it does not force volume removal or start workers against an unprepared snapshot.

Keep mounted runtime volumes and durable messaging enabled during normal operation. `docker restart` and ordinary container recreation retain messages; the staging CI reset is deliberate. Production persistence is unchanged. RabbitMQ's staging hostname is fixed so its node identity survives ordinary recreation.

Run the staging RabbitMQ health check and bootstrap CLI as the `rabbitmq` service user. On a fresh volume, a root health probe can create `/var/lib/rabbitmq/.erlang.cookie` before the broker, causing an `eacces` startup failure. The Compose probe uses `gosu rabbitmq`, and bootstrap uses `docker exec --user rabbitmq`. Increasing the health-check grace period does not prevent that race. If broker/Redis readiness fails, CI records their container state and recent logs before stopping; it does not start application writers against a partially prepared environment.

Each deployment invalidates Redis-backed one-time registration/co-author links and clears rate limits; Redis clearing alone does not sign users out. Unfinished test mail is discarded. No additional GitHub secrets are required: the broker account comes from `RMQ_URI` (AMQP defaults apply when credentials are omitted).

Cancellation applies to existing copied outbox jobs, not future messages generated by user actions or scheduled reminders. Staging notification tests still need controlled recipients or a mail sink; a rebuild cannot undo sent emails.

## Routine verification

From the repository root:

```sh
node scripts/verify.mjs client
node scripts/verify.mjs core
node scripts/verify.mjs mail
```

- Client: lint, typecheck, unit/interaction tests.
- Core: TypeScript build and unit tests; opt-in integration tests are skipped.
- Mail: lint, typecheck, unit tests, and the mocked Nest module integration test.
- These commands clear inherited `REVIEW_TEST_*` flags; integration tests only run when explicitly selected.
- A failed step stops verification and returns a failing exit code.

Add `--build` to build that service's production Docker target into `flawis-<service>-check` and verify its Node runtime. These builds use the Docker build context, not the running development client's `.next` directory. They do not restart application services.

```sh
node scripts/verify.mjs client --build
```

During iteration, run an affected test directly instead of repeatedly running all services. For example:

```sh
cd client
node --import tsx --test test/review-dialogs.test.ts
```

Scale verification to the change: a visual fix needs a focused browser check; state/validation changes need interaction tests; API/persistence changes need relevant core/integration checks; dependency/runtime updates need affected service suites and builds. Do not repeat successful broad checks without new changes or evidence of a problem.

For GraphQL contract changes, regenerate from core and then typecheck the client:

```sh
npm run schema --prefix core
npm run codegen --prefix client
npm run typecheck --prefix client
```

Commit both core schema files and the regenerated client contracts with the change. Do not regenerate them for unrelated edits.

## Staging integration tests

Run these from a checkout with the required Node version and core dependencies, either on the staging VM or through SSH forwards to its published ports. `--integration` starts no containers and changes no deployment configuration.

```sh
REVIEW_TEST_ENVIRONMENT=staging \
REVIEW_TEST_MONGODB_URI='mongodb://127.0.0.1:27018/flawis_reviews_test?replicaSet=rs0&directConnection=true' \
node scripts/verify.mjs core --integration
```

This runs the MongoDB workflow suite, including transactional rollback and form/review lifecycle checks. The fixture resets only the hardcoded `flawis_reviews_test` database. The transport suite is explicitly skipped unless `REVIEW_TEST_RABBITMQ_URI` is also set. Run one integration suite at a time because fixture names are shared.

| Existing staging service | Endpoint on the VM or forwarded locally |
| --- | --- |
| MongoDB replica set | `127.0.0.1:27018`, replica set `rs0`, direct connection |
| RabbitMQ test vhost | `127.0.0.1:5673/flawis-review-tests` |

The deployment automatically recreates the `flawis-review-tests` vhost and grants the configured staging broker account access. This is a namespace inside the existing service, not another Docker stack. The separate vhost prevents the running application mail worker from consuming test messages.

Set `REVIEW_TEST_RABBITMQ_URI` locally to `amqp://<user>:<password>@127.0.0.1:5673/flawis-review-tests` using the staging `RMQ_URI` account's URL-encoded credentials, then rerun the command above. Keep credentials out of version control. The transport test resets `flawis_notifications_test`, clears old review messages in the test vhost, and simulates delivery results; it sends no email. It checks persistent publishing and delivery claims without restarting the broker by default.

To also verify restart durability, run on the staging VM and explicitly set `REVIEW_TEST_RABBIT_CONTAINER=flawis-staging-rabbitmq-1`. This briefly interrupts staging messaging. The test checks both the container name and staging Compose labels before restarting it. A laptop tunnel is enough for normal integration checks, but restart checks must address the VM's Docker engine.

The wrapper and fixtures reject production endpoints. Database names are fixed in the fixtures, regardless of the URI path. Application-level destructive browser/API scenarios may additionally exercise the staging snapshot, followed by cleanup or a fresh snapshot deployment; the reusable fixtures do not drop the application database.

Check verification/deployment guards with `node --test scripts/*.test.mjs` when modifying these scripts. These tests do not connect to Docker or databases. If Docker runs out of space locally, remove only known disposable resources rather than application volumes.

## Staging browser checks

Playwright is pinned in the client lockfile. Install its browser once per version:

```sh
cd client
npx playwright install chromium
cp .env.e2e.example .env.e2e.local  # new setup only
npm run test:browser -- --project=public
```

The public checks verify the English and Slovak login pages without credentials. The authenticated checks require the review feature to have been deployed to staging and an account with access to reviewers/forms. Prefer a dedicated test account.

```sh
npm run test:browser:login
npm run test:browser
```

The login command opens Chromium for you to sign in and saves the resulting session in `client/playwright/.auth/staging.json` with restricted file permissions. It never asks for a password in chat or writes a password to a fixture. The session is still sensitive: do not share it, commit it, or copy it into an image. Repeat login when it expires.

The staging URL is checked against the configured university staging host. Production is rejected. `client/.env.e2e.local` can set `E2E_CONFERENCE_SLUG` to an existing review-enabled test conference; otherwise the four queue-navigation cases are explicitly skipped.

The initial authenticated suite covers reviewer dialog focus, the skip-link layout regression, invalid/unsaved drafts, header search and keyboard dismissal, and optional conference navigation. It runs in English/Slovak at desktop/mobile sizes, including light and dark appearance. It never saves a valid management form, uploads files, changes decisions, or sends notifications. The invalid-draft test additionally blocks write requests and fails if any are attempted.

Missing/expired login or an undeployed feature fails the session prerequisite; it is not reported as a passing workflow. Screenshots and traces are retained on failure under `client/test-results/`, with an HTML report under `client/playwright-report/`. These and auth state are ignored by Git; artifacts can contain snapshot data, so review them locally.

For client verification plus browser checks, use `node scripts/verify.mjs client --browser`. To inspect a result, run `npx playwright show-report` from `client/`.

Additional mutation or destructive scenarios can run against staging when selected deliberately. Prefer identifiable test records for repeatable checks; snapshot scenarios can modify existing staging records and be followed by restoration. Delivery scenarios need controlled test recipients or a confirmed mail sink. The default smoke suite needs no database seeding.

## Keeping agent guidance useful

Root/service `AGENTS.md` files contain stable conventions. [The agent workflow](agent-workflow.md) covers scoped helpers, documentation drift, JSDoc, and plan cleanup. Skill provenance and local customizations live in `.agents/skills/README.md`; feature rules live in their domain documents. Completed plans are deleted after durable knowledge moves to docs; unfinished validation stays in an active plan. Run `node scripts/docs-drift.mjs` for targeted documentation reminders before closing multi-step work. Read only the guidance relevant to the task.
