# Conference reviews

The conference workspace includes a reviewer directory, submission review queue, conference review settings and activity history. The directory and form library live at `/reviewers` and `/forms` on the FlawIS tenant. Conference routes are `/conferences/:slug/reviews`, `/conferences/:slug/review-settings`, and `/conferences/:slug/activity`.

The [2026-11-11 shared-chat comparison](reviews-chat-crosscheck.md) records coverage and gaps against the supplied conversation at commit `22ccb0fe`, including reviewer correction checks and final Word assembly.

The [2026-11-17 prototype comparison](bpf-prototype-crosscheck.md) records the gaps at commit `81fd98b3`. The coordinator workflow below describes the subsequent implementation of the BPF manuscript, online review, correction, proof and publication steps.

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
4. An author with a submission-enabled ticket uploads the original manuscript. Each replacement creates a numbered version and retains its predecessor. A coordinator can register historical submissions, upload an anonymous copy or generate a draft from Word. Inspect author names, affiliations, metadata, links, images and tracked changes before approving anonymity.
5. Choose the BPF questionnaire in review settings for the BPF workflow. At preparation the coordinator records English, B5, 150–200 abstract words, 4–6 keywords, bibliography and author contact details. Assign two independent reviewers for BPF. Author conflicts block assignment. Department, participation and guarantor warnings require a recorded override reason.
6. Prepare the anonymous package or send invitations using the existing RabbitMQ outbox and mail worker. The invitation attaches the approved anonymous manuscript and links to the assignment’s private online questionnaire. The sent round retains its manuscript and published form.
7. Reviewers can save drafts and submit from the private link without an account. The BPF form has four rating groups with comments and an overall recommendation. A conditional recommendation requires an explanation. Reviewers can download their submitted Word report. Coordinators retain manual report entry and reopening with a reason.
8. In a BPF round the coordinator selects and edits the points to send the author. In other rounds the configured textual answers and recommendation are released automatically after all required reports arrive. Private attachments and reviewer identities stay within the review workspace.
9. Issue a formal or post-review correction against a manuscript version with a deadline. A formal correction accepts one DOCX. A post-review receipt requires distinct clean and tracked DOCX files, up to 20 MiB each. Authors may submit a short note or a complete set of point responses. Each response records whether the point was addressed, an explanation and the location of any change. Staff deposits record the files without attributing statements to the author. Both files belong to one new version. Compare its clean text and footnotes with the previous version, record the result for each point, and issue a linked follow-up for unresolved points.
10. A coordinator may ask the original reviewer to check specific corrections through a separate private link. First approve the clean and tracked anonymous copies. The check records its own results against the exact files and report. The coordinator reviews the returned results and closes each submitted report on the current manuscript. Acceptance requires all required reports closed, verified conditions and formal approval. The BPF coordinator must separately confirm the author’s actual conference participation. A negative recommendation blocks acceptance.
11. After acceptance, select the final author Word and optionally attach a supplied proof PDF. Send a version-specific proof to the corresponding author. Authors approve via their workspace or private link. Staff can record external confirmation after mail delivery, or record no response after delivery and the deadline. Replacing files or changing the paper title, author names or recipient requires a new proof.
12. Approve the editorial ZIP, download it, then record its actual handoff. The archive contains the final DOCX, completed reports in reviewer-slot order, optional proof PDF and a publication-summary XLSX. Approval freezes the archive, including the workbook as of approval. Selected approved manuscripts from one conference can be assembled in the chosen reading order into a single editable Word document.

Original manuscript versions, anonymous copies, report revisions, rounds, feedback releases and actions remain available for authorized review. Generic submission deletion now withdraws the submission and preserves its history. Authors who are also administrators or coordinators cannot manage or inspect their own confidential review process. The same restriction applies to the original user behind an impersonated session.

The queue loads submissions in pages. Header search queries the server across eligible submissions before pagination and opens the selected result; it is not restricted to rows already loaded. The page supports a `search` URL parameter, and detail links preserve the queue URL for return navigation. Invitations operate on selected rows from the current page, record per-assignment outcomes, and skip successful sends on retry. Bulk report ZIP export accepts 1–50 submission IDs. Copying a personal review link prepares access without sending mail. Sending is explicit; SMTP is not an exactly-once protocol.

## Shared forms

`FormService` in core owns separate repositories for definitions, immutable versions, context bindings, current answers and immutable answer revisions. Both course applications and review rounds use this service and the same frontend answer controls. A new published version does not change existing applications or rounds. Existing applications display their pinned questionnaire, even after the course selects a different version.

The current contexts are `COURSE` and `REVIEW`. Answer writes validate field IDs, required answers, choice values, file ownership and expected revision. Drafts may omit required answers. Submitted review answers require an explicit reopening before modification. Updating a course application preserves its previous answer revisions and files. Removing a course binding does not delete a form used by other contexts.

The library publishing dialog and course wizard use the same shared `FormBuilder`. Its bottom row adds short text, long text, dropdown, single choice and file upload fields, preselecting the type and focusing the label. Library editing adds the final overall-recommendation shortcut (`PUBLISH`, `CONDITIONAL`, `REJECT`). Course forms can have no fields; library publishing requires at least one. Both hosts use generic Slovak/English labels and the same field validation.

Stored field IDs and choice values remain separate from the editor's row keys. Option values and display text have separate inputs. New optional uploads allow 0–10 files; making one required raises its minimum to at least 1. Existing configured limits are retained, with a maximum of 20. Publishing errors retain the draft, and retrying a new form reuses its already-created definition.

Rich-text help uses the existing editor and is formatted consistently in previews, course registrations and reviewer questionnaires. Preview HTML is parsed through the editor's supported nodes. Core sanitizes help during publication and when returning versions, including legacy help, without rewriting historical records.

### Conference templates

Administrators and conference-wide coordinators can publish one author manuscript template in the conference **Templates / Šablóny** tab. Authors can download it during registration or submission, independently of review enablement. When a template applies, core checks the page size and four margins of every Word section, allowing two twips for Word’s rounding. This checks layout compatibility. Files prepared with a different stylesheet can pass, including the supplied DEMO-01. Core rejects incompatible uploads before attaching them to a paper.

The first submission against a template pins it for subsequent revisions. Replacing or removing the conference template changes what new authors receive. An existing paper or private correction request can still download its pinned template. Uploads accept nonempty DOCX up to 20 MiB with page settings and reject detected macros and embedded binary entries. Publishing its file reference and audit event is atomic.

The review questionnaire is an immutable published form. A round pins the form and recommendation mapping. New rounds generate completed reports using the app’s built-in layout, including conferences that previously configured a custom Word layout. A historical round with an explicit saved layout still uses that file. Reviewer packages contain the approved anonymous manuscript. The online form is available at the private URL. Submitted reports can be downloaded individually or in a ZIP.

## Activity and file access

`ActivityService` records actor ID, original actor during impersonation, request correlation, action, conference/submission, changed field names and safe identifiers/reasons. Conference mutations use the same MongoDB transaction as their audit writes. An audit failure rolls back those database changes. Authenticated reads, lists, protected downloads and exports are recorded on a best-effort basis so a logging failure does not prevent reading data. The public manuscript-template download is not tied to an actor and is not audited. Activity is append-only through application APIs; database administrators still control retention and database permissions.

Activity access follows coordinator scope and author-conflict rules. Original manuscripts are available to their authors; anonymous manuscripts, reports, packages and review history require independent coordinator access or an appropriate private reviewer link. The generic MinIO helpers authorize reads/deletes through core and cannot write the protected `conference-reviews` bucket. Previously uploaded submission files are also checked against their submission's access policy.

Session tokens are now issued only by authentication/explicit impersonation operations. `User.token` is no longer a GraphQL field. Session version 2 invalidates sessions issued by the old generic token field: users must sign in again after rollout. Activation and password-reset tokens now require their own purpose claim, so they cannot accept session tokens. Existing activation/reset links must be requested again after rollout; coauthor tokens retain their validation.

## Mail transport and deployment

Application Dockerfiles and the root/client/mail `.nvmrc` files pin the same Node runtime; use [the root .nvmrc](../.nvmrc) as the version reference. Core follows the root pin. The [mail worker](../mail/README.md) runs as a Nest application context and does not expose an HTTP server. Its manifest and lockfile define the Nest, mailer/RabbitMQ adapter, Nodemailer, TypeScript, and test dependencies.

Set these variables consistently:

| Variable                  | Used by            | Purpose                                                           |
| ------------------------- | ------------------ | ----------------------------------------------------------------- |
| `RMQ_URI`                 | core, mail         | RabbitMQ URI                                                      |
| `RMQ_EXCHANGE`            | core, mail         | Durable topic exchange; default `FlawIS.notifications.v2`         |
| `NOTIFICATION_SECRET`     | core, client, mail | Encryption/internal authentication secret; falls back to `SECRET` |
| `CORE_INTERNAL_URL`       | mail               | Core base URL, default `http://core:5000`                         |
| `API_URI`                 | client             | Core GraphQL URL, default `http://core:5000/graphql`              |
| `CONFERENCES_PUBLIC_HOST` | core               | Conference hostname used by scheduled reminders                   |

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
6. Verify signup/reset, conference invoices, coauthor invitations, course notifications, internship notifications, and one review invitation using test recipients before enabling real review mail. Appoint conference/section coordinators and upload the author manuscript template.

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

To replay the supplied November BPF documents, set `BPF_HANDOVER_DIRECTORY` to the folder containing `01_Pravidla_a_sablony` and `02_Vzorovy_pripad` when running the [staging MongoDB workflow suite](development.md#staging-integration-tests). The fixture reads the local sample files, uses in-memory object storage, compares the corrected Methods paragraph and checks that the final DOCX and PDF in the approved archive match the supplied bytes. With the variable unset it generates its own small fixtures. The integration test records notification jobs in its dedicated database.

BPF lifecycle verification on 2026-11-18 passed client lint, typecheck and 149 client tests. Core passed 100 tests using the dedicated staging MongoDB database and RabbitMQ test vhost. The unrelated course-repair fixture was skipped. Isolated client and core production images built and started Node successfully. The DEMO-01 test exercised the supplied Word and PDF files through correction, approval and editorial export. Forty local Chromium fixture cases covered the manuscript-template screen, online reviewer questionnaire, paired correction, targeted reviewer check and final proof in SK/EN, light/dark, desktop/mobile, with keyboard interactions. API actions were stubbed for these browser fixtures. Transport verification used the isolated broker namespace without restarting the broker or sending SMTP mail.

Local verification on 2026-11-12 for the unified builder and component moves passed client lint/typecheck, 136 unit/interaction tests, and an isolated production Docker build. Core build and 79 tests passed; three opt-in integration suites were skipped. Builder tests cover all field types, stable IDs and choice values, rich help, empty/invalid-field focus, file limits, course wizard navigation/saving, immutable source drafts, and library publishing failure/retry. Browser checks passed for both builders, the reviewer directory, conference review queue/settings/activity, public conference pages and invalid review/revision links in English/Slovak at desktop/light and mobile/dark sizes, including keyboard and scrolling checks. Browser checks saved no forms or courses; publishing and saving were exercised through interaction-test callbacks. Live reviewer submission, author feedback and delivery scenarios were not repeated for this refactor.

Recorded staging verification on 2026-11-10 at `c853292b`: all 90 core tests passed, including the MongoDB workflow and notification transport suites, with none skipped. Fixtures used only the dedicated test databases/vhost and were cleaned up afterwards; no email was sent. Broker restart was not selected in this staging run, so it verifies transport without restart durability. The associated [deployment run](https://github.com/BobbiSixkiller/FlawIS/actions/runs/42783459986) also passed runtime reset, restore, notification cancellation, broker initialization and application startup; the snapshot contained zero unfinished jobs, so it did not exercise nonzero cancellation.

The earlier UX validation used a separate local `flawis_ux_browser` database and Mailpit recipients under `example.test`. Its recorded coverage included English/Slovak desktop/mobile pages, dark mode, queue search and return navigation, independent action drafts, dirty-dialog dismissal, field validation, CSV import/export, questionnaire publishing/mapping, reviewer draft reload and uploads, visibility labels, submission/decline confirmations, invalid private links, and batch retries. Those historical scenarios are not all automated by the maintained smoke suite. The current `client/e2e` suite targets staging and covers the focused cases listed in the development guide. Reusable dialog interaction tests additionally verify failed-save recovery and duplicate-submit prevention.

When the Docker development client is running, build with an isolated output mount so the production build does not replace its live `.next` files:

```sh
docker compose run --rm --no-deps -e NODE_ENV=production -v /usr/app/.next client npm run build
```

Conference-template verification on 2026-11-13: client lint, typecheck, all 140 unit/interaction tests and an isolated production Docker build passed. Core build and staging MongoDB integration checks passed (96 tests passed; the unrelated course-repair and RabbitMQ transport opt-in tests were skipped). The template coverage includes conference/section permissions, disabled-review availability, current-template-only public HTTP downloads, protected raw files, cross-conference/purpose rejection, audit rollback, replacement/removal, round-pinned generation and Word formatting. Browser checks passed all eight SK/EN × light/dark × desktop/mobile combinations for the new dialogs, invalid-file focus, dirty dismissal, keyboard focus restoration, mobile overflow and form-card alignment. Authenticated staging inspection reproduced a 22 px desktop form-footer gap; a temporary browser application of the same CSS reduced it to zero in both languages/themes and preserved mobile layout. No application records were changed by the browser checks, no notifications were sent, and no deployment was performed. Documentation drift reminders and the scoped factual documentation audit were reviewed.
