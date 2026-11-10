# Pending staging validation

Implementation of the agent workflow, verification commands, staging runtime reset, and exchange configuration is complete locally. Durable instructions are in [development.md](../development.md), [agent-workflow.md](../agent-workflow.md), and [conference-reviews.md](../conference-reviews.md). This plan preserves checks that require deploying the current feature and accessing staging. No merge, push, or deployment has been performed as part of the local setup work.

## Remaining acceptance checks

- [ ] After the usual authorized staging deployment, verify the complete workflow resets only staging RabbitMQ/Redis, restores MongoDB, cancels copied unfinished notifications, bootstraps the broker, and starts healthy services with `RMQ_EXCHANGE`. Inspect deployment logs without exposing credentials. Production persistence must remain unchanged.
- [ ] Run the adapted MongoDB and notification transport integration suites against the existing staging services with dedicated fixture databases and the `flawis-review-tests` vhost. Record actual results. Select broker restart only as an explicit test step because it interrupts shared staging messaging.
- [ ] Save a staging browser login locally and run the authenticated smoke suite in both languages at desktop/mobile sizes. Set `E2E_CONFERENCE_SLUG` to include the four conference-navigation cases. Record skipped cases separately.
- [ ] Check duplicate skill discovery in a fresh app session; current CLI discovery has the limitation recorded in the durable agent-workflow document.

After required checks pass, retain any useful operating corrections in docs and delete this plan. If a check cannot run, retain its prerequisite and unresolved status here.

## Staging attempt, 2026-11-10

[Run 42778153669](https://github.com/BobbiSixkiller/FlawIS/actions/runs/42778153669) at `993bf0b7` completed runtime-volume reset, MongoDB restore, unfinished-notification cancellation, MinIO sync, and image builds. It failed at fresh RabbitMQ readiness, so broker bootstrap and application startup were skipped. SSH inspection confirmed `/var/lib/rabbitmq/.erlang.cookie: eacces` during first boot; the root health probe could create the cookie before the broker user. RabbitMQ recovered after one automatic restart, but staging core/client/mail had not started when inspected.

The local fix runs the probe and bootstrap CLI as `rabbitmq` and adds failure diagnostics. An isolated first-boot regression reproduced the old failure and passed with the service-user probe. A separate RabbitMQ 4.1.2 fixture using the unmodified image entrypoint passed fresh-volume startup, definitions import as the service user, both vhost permissions, and an ordinary restart retaining configuration. Disposable fixture containers/volumes were removed. All 18 helper tests and Compose/workflow validation passed. The complete staging deployment still needs a new run containing the fix. Re-running the failed commit does not include local changes. See the development guide for [remote diagnosis](../development.md#remote-diagnosis); connection details stay in private local notes.

## Historical local evidence, 2026-11-09

- Verification/deployment helper tests: 14 passed at implementation time. Covers inherited integration flags, staging target guards, volume ownership/removal scope, failure propagation, stopped-writer checks, broker initialization, and cancellation scope.
- Client lint/typecheck, 123 tests, and production Docker build passed. The existing encryption-key build-argument warning remained. Core build and 77 tests passed; two integration suites were skipped without opt-in connection variables. Mail lint/typecheck, 18 unit tests plus one mocked module test, production image/runtime checks passed. The module test covers custom `RMQ_EXCHANGE` use across subscriptions and result publishing.
- Earlier core validation passed 90 tests including workflow integration and broker restart against the now-removed local fixture stack. That does not validate the adapted staging target.
- Playwright collected 19 cases; two public staging login cases passed. Missing authentication failed the session prerequisite as intended. The 16 authenticated cases remain unexecuted; four require a conference slug.
- Staging Compose preflight, workflow YAML/order/shell checks, and default/override exchange checks passed locally.
- Temporary RabbitMQ 4.1.2 checks passed definitions import via stdin, salted credentials, application/test permissions, repeat import/account update, and persistence through ordinary restart. Temporary MongoDB 8.0.20 checks passed unfinished-only cancellation, retained terminal history/payloads, retry/lease cleanup, and idempotence. All temporary resources were removed; the eight normal local services remained running.
- Temporary fixture startup required a broker readiness probe using its service user to avoid a root cookie race, and the compatible cached MongoDB 8.0.20 image because cached `mongo:8.0` failed on Docker Desktop's kernel. These did not change deployed database versions. Staging's broker health check waits for `check_running`.
- At the user's request, GitHub `staging` and `production` environment variables were updated and read back as `RMQ_EXCHANGE=FlawIS.notifications.v2`. No deployment was triggered. Local core/mail were recreated and verified using the canonical variable.
- All five repository skills passed manifest validation. Metadata and duplicate-discovery limitations are documented in the durable agent-workflow page.
