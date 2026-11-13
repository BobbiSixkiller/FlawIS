# Mail worker conventions

- Mail is a headless NestJS application context; it does not expose an HTTP server.
- Preserve durable exchanges/queues, persistent messages, delivery claims, acknowledgements, retry behaviour, and uncertain-delivery handling.
- An enqueue result means queued, not delivered. Do not turn an uncertain result into an automatic resend that can duplicate mail.
- Keep templates and user-facing messages consistent with the existing Slovak/English workflow.
- Prefer the existing module/provider structure over a new messaging abstraction for a small change.
- Use `node scripts/verify.mjs mail` for lint, typecheck, unit tests, and the mocked module integration test; add `--build` for compilation.
- Local delivery verification uses Mailpit. Staging can contain real addresses from a production snapshot: default browser smoke tests must not send invitations, reminders, or decisions.
- Staging delivery tests use controlled test recipients or a confirmed mail sink. Fixture transport tests use a separate vhost on the existing broker and simulate the delivery result without sending email.
- Staging CI deliberately resets the broker volume and cancels copied unfinished outbox jobs before startup. Preserve normal restart durability; do not add this reset behaviour to production or the worker itself.
- Read `docs/development.md` for commands and `docs/conference-reviews.md` for notification contracts.
