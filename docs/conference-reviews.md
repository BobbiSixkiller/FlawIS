# Conference reviews

The conference workspace includes a reviewer directory, submission review queue, conference review settings and activity history. The directory and form library live at `/reviewers` and `/forms` on the FlawIS tenant. Conference routes are `/conferences/:slug/reviews`, `/conferences/:slug/review-settings`, and `/conferences/:slug/activity`.

The [2026-11-11 shared-chat comparison](reviews-chat-crosscheck.md) records coverage and gaps against the supplied conversation at commit `22ccb0fe`, including reviewer correction checks and final Word assembly.

## Review workspace UX

Open a submission at `/conferences/:slug/reviews/:submissionId`. Its manuscript, review rounds, revisions/decision and activity have separate tabs. Management actions open focused dialogs; revision deadlines, assignment deadlines, editorial reasons and manual report answers are scoped to the current action. Dirty dialogs require an explicit discard decision, preserve values after errors and block duplicate saves. Reviewers complete their questionnaire on a full page, with author-visibility labels, attachment progress, draft feedback and confirmation before final submission or decline.

The queue API supports server-side search and filtering before pagination. The user interface exposes a simple header search; return navigation preserves the queue URL and page cursor. Editorial, report and email states are shown separately. An enqueue confirmation means “Email queued”; uncertain delivery requires an acknowledgement before resending. Batch invitations and CSV imports retain per-item results and skip successful items on retry.

The reviewer directory exports every matching record, including matches beyond the current page. CSV preview distinguishes new, updated and invalid contacts; updates preserve archived status. Form publishing creates immutable versions with stable question and choice identifiers. Settings dialogs patch only the selected group, validate questionnaire compatibility and explain which changes affect future rounds. Coordinator and eligibility mutations commit their audit event in the same MongoDB transaction.

The directory, submission queue and form library expose the shared search dialog through their `@headerActions` routes, matching users and conferences. Search selects a reviewer, form or submission; there are no filter controls. Reviewer search includes archived contacts, which remain visibly labelled. A fallback slot clears the previous search control when navigating to another page. Reviewer languages and expertise use the generic multiple-selection combobox, with existing suggestions and custom values. Attachment questions use the shared multiple-file uploader in previews and live answers. The builder configures minimum and maximum counts (up to 20); already uploaded files count toward the maximum. Optional questions can remain empty, with their minimum applying when files are attached.

The reviewer directory's export/import/Add toolbar and the shared header-search trigger stay disabled until their component hydrates, so the first enabled click has an active handler. The existing `useMounted` hook supplies the server/client readiness snapshot; no timer or page-wide readiness flag is needed.

This UX update needs no course reset or production data migration. The one-time course reset instructions below belong to the original shared-form transition.

## Local development

Follow [local setup and dependency refresh](development.md#setup-and-services). The local Compose configuration captures outgoing mail in Mailpit instead of sending it externally.

- Admin workspace: <http://flawis.localhost:3000> (plain `localhost:3000` also works)
- Conference participant site and private review links: <http://conferences.localhost:3000>
- Email preview: <http://localhost:8025>

Use existing local accounts and sign in again after the session-token migration. Development invitations use `conferences.localhost:3000` even when the coordinator opens the admin site on plain `localhost`. Persistent data remains in named volumes; renewing anonymous volumes refreshes container dependencies.

## Coordinator workflow

1. An administrator appoints a conference coordinator using an existing verified FlawIS account. Administrators and conference coordinators can appoint section coordinators. There are no paper-level grants. Permissions are checked against current database grants on every request.
2. Enable reviewing in the conference's review settings. Choose the required number of reports (default two), questionnaire version, author-visible questions, email instructions, signature and reply-to address. Set manuscript requirements for individual sections independently of the presentation language. Automatic reminders are opt-in.
3. Add reviewers to the shared directory, or import a CSV after previewing it. Fields: `name,email,institution,department,languages,expertise,notes`; separate multiple languages and areas of expertise with semicolons. Email addresses identify duplicate contacts. Archive reviewers to keep their history.
4. The queue includes submissions with at least one registered author holding a ticket with submission rights. Register the existing uploaded manuscript or upload a new version. Upload an anonymous copy and explicitly approve formal checks and anonymity. Anonymization is a manual editorial responsibility; the application does not remove names or project acknowledgements automatically.
5. Inspect reviewer history and conference eligibility before assigning reviewers and deadlines. Self-review is blocked by author account/email history. Participation, guarantor, department and declared-conflict warnings require a recorded override reason. Administrators and conference coordinators can edit conference eligibility; section-only grants do not allow it.
6. Preview and send individual or batch invitations. Sending requires the approved anonymous copy. Each invitation attaches that copy and includes a private questionnaire link. Track invitation delivery separately from assignment/report status. Preparing a downloadable package does not send mail.
7. Reviewers need no account. They can download the anonymous manuscript and attachments permitted for their assignment, save drafts, decline or submit the report. Submission locks the report; coordinators can reopen it with a reason or enter a report received outside the portal. Cancelling an assignment revokes its link. Tokens are random, stored as hashes for lookup and encrypted where a reminder needs the original link.
8. All required active assignments in a round must be submitted before anonymized feedback is automatically released. Only configured textual answers and the recommendation are released; reviewer names, email addresses, internal fields and private attachment references are excluded. Repeated submissions cannot release the same report revisions twice.
9. Request corrections with instructions and a deadline. Authors can upload DOCX corrections from their signed-in conference workspace or the private correction link. Every upload creates a manuscript version. A coordinator verifies the correction. A further review round is an explicit action; uploading corrections never sends them to reviewers automatically.
10. Record an editorial decision and reason. Acceptance requires the required reports and no outstanding unverified corrections. Decisions are distinct from reviewer recommendations. Closing a paper revokes reviewer links and outstanding correction requests. Reopening a closed paper does not restore revoked links automatically.

Original manuscript versions, anonymous copies, report revisions, rounds, feedback releases and actions remain available for authorized review. Generic submission deletion now withdraws the submission and preserves its history. Authors who are also administrators or coordinators cannot manage or inspect their own confidential review process. The same restriction applies to the original user behind an impersonated session.

The queue loads submissions in pages. Header search queries the server across eligible submissions before pagination and opens the selected result; it is not restricted to rows already loaded. The page supports a `search` URL parameter, and detail links preserve the queue URL for return navigation. Invitations operate on selected rows from the current page, record per-assignment outcomes, and skip successful sends on retry. Bulk report ZIP export accepts 1–50 submission IDs. Copying a personal review link prepares access without sending mail. Sending is explicit; SMTP is not an exactly-once protocol.

## Shared forms

`FormService` in core owns separate repositories for definitions, immutable versions, context bindings, current answers and immutable answer revisions. Both course applications and review rounds use this service and the same frontend answer controls. A new published version does not change existing applications or rounds. Existing applications display their pinned questionnaire, even after the course selects a different version.

The current contexts are `COURSE` and `REVIEW`. Answer writes validate field IDs, required answers, choice values, file ownership and expected revision. Drafts may omit required answers. Submitted review answers require an explicit reopening before modification. Updating a course application preserves its previous answer revisions and files. Removing a course binding does not delete a form used by other contexts.

The library publishing dialog and course wizard use the same shared `FormBuilder`. Its bottom row adds short text, long text, dropdown, single choice and file upload fields, preselecting the type and focusing the label. Library editing adds the final overall-recommendation shortcut (`PUBLISH`, `CONDITIONAL`, `REJECT`) and optional DOCX placeholder details. Course forms can have no fields; library publishing requires at least one. Both hosts use generic Slovak/English labels and the same field validation.

Stored field IDs and choice values remain separate from the editor's row keys. Option values and display text have separate inputs. New optional uploads allow 0–10 files; making one required raises its minimum to at least 1. Existing configured limits are retained, with a maximum of 20. Publishing errors retain the draft, and retrying a new form reuses its already-created definition.

Rich-text help uses the existing editor and is formatted consistently in previews, course registrations and reviewer questionnaires. Preview HTML is parsed through the editor's supported nodes. Core sanitizes help during publication and when returning versions, including legacy help, without rewriting historical records.

### DOCX report templates

An initial questionnaire and baseline DOCX report are available without an uploaded template. Upload the actual official template in review settings to retain its layout and wording. No official template was included in the exported conversation file.

Insert placeholders into the uploaded DOCX:

- `{paper}`, `{reviewer}`, `{recommendation}`, `{date}`
- `{answers}` for all labelled answers
- `{answer_FIELD_ID}` for one answer; copy the stable field ID from the form version
- `{publish}`, `{conditional}`, `{reject}` for checked/unchecked recommendation boxes

Templates and questionnaires are pinned to a round. Uploaded templates are validated as DOCX. Packages contain the approved anonymous manuscript and a blank report; exports contain completed DOCX reports, individually or as a ZIP. Private attachment references are not inserted into report text.

## Activity and file access

`ActivityService` records actor ID, original actor during impersonation, request correlation, action, conference/submission, changed field names and safe identifiers/reasons. Conference mutations use the same MongoDB transaction as their audit writes. An audit failure rolls back those database changes. Reads, lists, downloads and exports are recorded on a best-effort basis so a logging failure does not prevent reading data. Activity is append-only through application APIs; database administrators still control retention and database permissions.

Activity access follows coordinator scope and author-conflict rules. Original manuscripts are available to their authors; anonymous manuscripts, reports, packages and review history require independent coordinator access or an appropriate private reviewer link. The generic MinIO helpers authorize reads/deletes through core and cannot write the protected `conference-reviews` bucket. Previously uploaded submission files are also checked against their submission's access policy.

Session tokens are now issued only by authentication/explicit impersonation operations. `User.token` is no longer a GraphQL field. Session version 2 invalidates sessions issued by the old generic token field: users must sign in again after rollout. Activation and password-reset tokens now require their own purpose claim, so they cannot accept session tokens. Existing activation/reset links must be requested again after rollout; coauthor tokens retain their validation.

## Mail transport and deployment

Application Dockerfiles and the root/client/mail `.nvmrc` files pin the same Node runtime; use [the root .nvmrc](../.nvmrc) as the version reference. Core follows the root pin. The [mail worker](../mail/README.md) runs as a Nest application context and does not expose an HTTP server. Its manifest and lockfile define the Nest, mailer/RabbitMQ adapter, Nodemailer, TypeScript, and test dependencies.

Set these variables consistently:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `RMQ_URI` | core, mail | RabbitMQ URI |
| `RMQ_EXCHANGE` | core, mail | Durable topic exchange; default `FlawIS.notifications.v2` |
| `NOTIFICATION_SECRET` | core, client, mail | Encryption/internal authentication secret; falls back to `SECRET` |
| `CORE_INTERNAL_URL` | mail | Core base URL, default `http://core:5000` |
| `API_URI` | client | Core GraphQL URL, default `http://core:5000/graphql` |
| `CONFERENCES_PUBLIC_HOST` | core | Conference hostname used by scheduled reminders |

Staging and production workflows read the optional GitHub environment variable `RMQ_EXCHANGE`, defaulting to `FlawIS.notifications.v2`, and pass the same value to core and mail. Local development reads it from `.env`. This exchange carries all application notification emails.

Use `RMQ_EXCHANGE=FlawIS.notifications.v2` for the durable transport rollout. The previous `FlawIS` exchange was declared non-durable; reusing that name on an existing broker requires a separate controlled cutover. The dead-letter exchange is derived as `${RMQ_EXCHANGE}.dead` and needs no additional environment setting.

Use a separate, persistent `NOTIFICATION_SECRET` in deployed environments. Changing it makes existing encrypted outbox payloads and reminder tokens unreadable. Do not print it in logs or place it in public Next.js variables.

Notification requests are encrypted MongoDB outbox records. The dispatcher declares durable work/result/dead-letter queues, binds them to durable exchanges and publishes persistent messages with publisher confirmations. The worker claims each job in core before contacting SMTP, acknowledges completed handling and publishes a persistent result. Transient failures receive bounded, persisted retries. Malformed results are dead-lettered; transient database errors requeue result messages. Expired/revoked invitation jobs are cancelled before sending.

SMTP timeouts fit within the delivery lease. Ambiguous SMTP DATA failures and expired worker leases are marked `UNKNOWN`; they are not automatically resent. Verify delivery before using the coordinator's explicit resend action. An SMTP acknowledgement cannot prove mailbox receipt. A missing result after SMTP success similarly requires investigation rather than blind retry.

Roll out core, client and mail together:

1. Back up MongoDB, MinIO and RabbitMQ state. Quiesce writes and stop old mail consumers/producers for the cutover.
2. Inspect/drain the old exchange's queues before retiring them. The new `.v2` topology does not reinterpret the old non-durable exchange, and this change cannot recover messages already lost there. Do not run old and new workers concurrently on the same notification flow.
3. Reconcile legacy courses before serving course traffic with the shared-form model. Use the [preserving repair](course-form-compatibility.md) for courses without attendees that must remain available; the reset below is only for course data deliberately being discarded. Courses with applications require an answer migration. MongoDB must run as a replica set to support transactions.
4. Ensure the existing RabbitMQ data volume and **node identity/hostname** survive ordinary container recreation. Development and staging pin a hostname and volume. Preserve the current production node name when pinning it during rollout; do not invent a new production node name over an existing data directory. Staging CI deliberately resets its RabbitMQ/Redis volumes and cancels copied unfinished notification jobs on each snapshot deployment; see [runtime reset](development.md#runtime-reset-on-each-staging-deployment).
5. Build and deploy all three services with matching exchange and secret settings. Core creates the new topology; start the worker afterwards. Keep RabbitMQ's data volume on ordinary broker restarts/replacements; staging CI is the explicit reset exception. Core must not expose its `/internal/notifications` endpoints outside the internal network without their shared-secret check.
6. Verify signup/reset, conference invoices, coauthor invitations, course notifications, internship notifications, and one review invitation using test recipients before enabling real review mail. Appoint conference/section coordinators and upload the official template.

Local development startup does not deploy to production or staging. Course resets require an explicit environment and database; the commands below default to a dry run.

### One-time reset of unused courses

The reset deletes course data and is not a compatibility repair. To retain a course without attendees, use the [preserving repair](course-form-compatibility.md). The reset is deliberately explicit and defaults to a dry run. Run against the chosen environment using its own connection and storage credentials, with course traffic/mail paused:

```sh
cd core
npm run reset:courses -- --environment=staging --database=flawis
# Review the counts, environment and database, then apply the same target:
npm run reset:courses -- --environment=staging --database=flawis --apply
```

`MONGODB_URI` must point at the intended staging deployment. The checked-in staging Compose/workflow uses database `flawis`, despite the staging environment name. The database argument selects it explicitly; `--environment=staging` is a label, not an endpoint guard. Confirm the connection and database and take a backup before applying. For another deployment, replace both targets; the command does not infer them from a URI or hostname. This migration is not run by ordinary local startup or the verification wrapper.

The reset removes courses, categories, sessions, attendees, attendance records, legacy course-owned forms, course bindings/answers/revisions, course attendee test invoices and cancels pending course mail jobs. It preserves user accounts, conferences, submissions, shared invoice counters, reusable form definitions/versions and external Reach resources. It drops the obsolete course/version form indexes.

Only objects in the course storage bucket that are referenced by removed records and unreferenced by surviving application records are deleted. Shared images and other buckets are preserved. A uniquely keyed maintenance checkpoint makes the database reset one-time; file deletion is resumable if MinIO is unavailable. Rerun the same applied command to finish pending file cleanup. Do not remove the checkpoint to repeat the reset.

## Validation

Use [the development guide](development.md) for service verification commands, GraphQL regeneration, and staging integration/browser tests. Keep the three existing Compose files. Destructive staging scenarios are a deliberate test step, followed by cleanup or snapshot restoration as needed.

The workflow integration test checks shared-form isolation, optimistic concurrency, rollback, self-review/impersonation conflicts, file scope, exactly-once feedback release, DOCX export, revisions and decision gating. These fixtures use dedicated databases on staging. The transport integration test uses a separate vhost on the existing staging broker; restart durability requires the explicit restart flag. Unit/UI tests cover audit failures, session migration, ciphertext tampering, reset scope, CSV import, progress calculation and shared answer controls.

Local verification on 2026-11-12 for the unified builder and component moves passed client lint/typecheck, 136 unit/interaction tests, and an isolated production Docker build. Core build and 79 tests passed; three opt-in integration suites were skipped. Builder tests cover all field types, stable IDs and choice values, rich help, empty/invalid-field focus, file limits, course wizard navigation/saving, immutable source drafts, and library publishing failure/retry. Browser checks passed for both builders, the reviewer directory, conference review queue/settings/activity, public conference pages and invalid review/revision links in English/Slovak at desktop/light and mobile/dark sizes, including keyboard and scrolling checks. Browser checks saved no forms or courses; publishing and saving were exercised through interaction-test callbacks. Live reviewer submission, author feedback and delivery scenarios were not repeated for this refactor.

Recorded staging verification on 2026-11-10 at `c853292b`: all 90 core tests passed, including the MongoDB workflow and notification transport suites, with none skipped. Fixtures used only the dedicated test databases/vhost and were cleaned up afterwards; no email was sent. Broker restart was not selected in this staging run, so it verifies transport without restart durability. The associated [deployment run](https://github.com/BobbiSixkiller/FlawIS/actions/runs/42783459986) also passed runtime reset, restore, notification cancellation, broker initialization and application startup; the snapshot contained zero unfinished jobs, so it did not exercise nonzero cancellation.

The earlier UX validation used a separate local `flawis_ux_browser` database and Mailpit recipients under `example.test`. Its recorded coverage included English/Slovak desktop/mobile pages, dark mode, queue search and return navigation, independent action drafts, dirty-dialog dismissal, field validation, CSV import/export, questionnaire publishing/mapping, reviewer draft reload and uploads, visibility labels, submission/decline confirmations, invalid private links, and batch retries. Those historical scenarios are not all automated by the maintained smoke suite. The current `client/e2e` suite targets staging and covers the focused cases listed in the development guide. Reusable dialog interaction tests additionally verify failed-save recovery and duplicate-submit prevention.

When the Docker development client is running, build with an isolated output mount so the production build does not replace its live `.next` files:

```sh
docker compose run --rm --no-deps -e NODE_ENV=production -v /usr/app/.next client npm run build
```
