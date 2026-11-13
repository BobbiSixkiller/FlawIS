# FlawIS mail worker

Headless NestJS application that consumes RabbitMQ notification jobs and sends email through Nodemailer and the Nest mailer adapter. It uses Handlebars templates and Slovak/English translations. It starts with `NestFactory.createApplicationContext`; there is no HTTP server or health URL.

## Development and checks

Use the [root setup](../README.md), the Node version in [../.nvmrc](../.nvmrc), and `npm ci` in this directory for host-side tooling. Local Compose starts the worker with the application services and routes SMTP to Mailpit at `mailpit:1025`. Read captured messages at <http://localhost:8025>.

| Command from `mail/` | Purpose |
| --- | --- |
| `npm run start:dev` | Watch-mode worker; requires broker, core, and mail configuration |
| `npm run build` | Clean and compile the Nest application |
| `npm run start:prod` | Run the compiled worker |
| `npm run lint` / `npm run typecheck` | Static checks |
| `npm test -- --runInBand` | Unit tests |
| `npm run test:e2e -- --runInBand` | Nest module integration test with mocked RabbitMQ, SMTP, and core responses |

The `test:e2e` name does not imply live delivery testing. From the repository root, `node scripts/verify.mjs mail` runs lint, typecheck, both test commands, and clears inherited integration flags. Add `--build` for the production Docker image/runtime check. See [verification](../docs/development.md#routine-verification).

## Configuration

Compose injects the root `.env`; a host-started worker needs its environment configured separately. Start from [../.env.example](../.env.example).

| Variable | Purpose |
| --- | --- |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM` | Required SMTP host, port, and sender |
| `MAIL_USER`, `MAIL_PASSWORD` | SMTP authentication when both values are set; local Mailpit uses neither |
| `RMQ_URI` | Required RabbitMQ connection URI |
| `RMQ_EXCHANGE` | Shared durable topic exchange; default `FlawIS.notifications.v2` |
| `NOTIFICATION_SECRET` | Authentication for internal delivery operations; falls back to `SECRET` |
| `CORE_INTERNAL_URL` | Core base URL; default `http://core:5000` |
| `CLIENT_INTERNAL_URL` | Invoice PDF rendering service; default `http://client:3000` |
| `INVOICE_RENDER_SECRET` | Shared mail/client PDF-render authentication secret; falls back to `SECRET` |

The application secret settings must agree across the services that use them. Keep the notification secret stable so core can read previously encrypted outbox payloads. The dead-letter exchange derives from `${RMQ_EXCHANGE}.dead`; it has no separate environment variable.

## Delivery behaviour

Core persists encrypted notification requests and publishes persistent jobs with publisher confirmations. The worker claims each job through core before contacting SMTP, then publishes a persistent delivery result. Templates live in `src/email/templates/`, translations in `src/email/locales/`, handlers in `src/email/email.service.ts`, and broker setup in `src/rmq/`.

“Queued” is distinct from “sent”. Transient failures have bounded retries; ambiguous delivery is marked `UNKNOWN` and needs investigation before explicit resend. SMTP acceptance is not proof of mailbox receipt. See [the notification contract and coordinated rollout](../docs/conference-reviews.md#mail-transport-and-deployment).

Staging deployment deliberately resets its broker/Redis state and cancels copied unfinished jobs before startup. Ordinary restarts preserve durable messages. Use controlled recipients or a confirmed mail sink for staging delivery checks; the snapshot may contain real addresses. [Transport fixtures](../docs/development.md#staging-integration-tests) use the separate test vhost and simulate delivery results without sending email.
