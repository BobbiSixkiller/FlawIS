# Preserving a legacy course with shared forms

The shared-form release reads a course's registration form through `formbindings` and requires a `definition` on each form version. Older courses instead have `forms.course` and no binding. Their list entry can remain visible while the detail query fails with `No form is assigned.` and redirects to the list.

Use [migrate-course-forms.ts](../core/scripts/migrate-course-forms.ts) to preserve a legacy course **without attendees**. Courses with existing applications need a migration of their pinned answers as well; this script refuses them. Do not use the destructive unused-course reset for courses that should remain available.

## Repair contract

The script requires an explicit database, course and existing verified administrator as the migration actor. It defaults to a dry-run. Applying the repair:

- Writes a mode-0600 Extended JSON backup to a new path, refusing to overwrite an existing backup.
- Creates one shared form definition covering all legacy versions and binds the course to its latest version.
- Adds only the definition reference to existing form documents. It retains form IDs, questions, choices, timestamps, version numbers and the legacy course reference. The course document, registration dates, files and other records remain unchanged.
- Uses a transaction and checks that the inspected course/form state still matches the backup. Inconsistent or partially migrated data causes a failure instead of an overwrite.
- Returns without writes when the shared configuration is already valid, including when a newer shared version has subsequently been selected.

The script has no mail or Reach integration. Existing indexes remain intact for the legacy application. This is a course data repair, not a complete shared-form rollout or retirement of legacy indexes. If the older application subsequently creates new legacy form versions, reconcile them before promotion; the script refuses partial configurations rather than choosing between conflicting versions.

## Execution

Use the approved connection in the private deployment runbook. Verify the target's Compose project and database before running commands. `--environment` is an audit label, not a connection guard; `MONGODB_URI` chooses the server. Keep backups outside ephemeral application containers and outside Git.

Build the script from the repository's pinned Node environment:

```sh
npm run build --prefix core
cd core
node dist/scripts/migrate-course-forms.js --environment=staging --database=flawis --course=COURSE_ID --actor=ADMIN_ID
node dist/scripts/migrate-course-forms.js --environment=staging --database=flawis --course=COURSE_ID --actor=ADMIN_ID --apply --backup=/private/backups/course-before.ejson
```

Run the dry-run and repair separately for production after staging verification. Preserve the legacy fields while production still runs the older reader. Updating production data also makes the restored course compatible with future staging snapshots.

Verify the course's GraphQL registration form, all original form versions and the authenticated detail/attendance pages. Compare the course and original form contents with the backup. Direct database writes do not invalidate Next.js fetch caches: if a failed detail result remains cached, evict only entries tagged `courses:COURSE_ID` and restart that client process to clear its memory cache. Retain a temporary private copy of evicted entries; they may contain session-specific response data. Do not reset Redis or other services for this repair.

For rollback, first compare the current definition, binding and form documents with the backup's `added`/`before` records. If there have been subsequent edits or answers using the shared form, reconcile those changes rather than restoring blindly. For an unchanged repair, remove the added binding/definition and the added definition references in one transaction. Keep the original course and form fields. Clear the affected cache again. Rolling back also restores the new application's original access failure.

## Focused validation

The migration integration test runs by itself against the existing staging MongoDB through the documented loopback connection. It uses and cleans only `flawis_reviews_test`; do not run it concurrently with another suite using that database.

```sh
REVIEW_TEST_ENVIRONMENT=staging \
COURSE_FORM_MIGRATION_TEST_URI='mongodb://127.0.0.1:27018/?directConnection=true' \
node --test core/dist/test/courseFormMigration.integration.test.js
```

It checks dry-run behavior, administrator/attendee guards, backup protection, transaction rollback, preservation of documents and indexes, repeat runs, and preservation of later form selections. It sends no notifications.

## Recorded repair: 2026-11-11

Both staging and production contained one legacy course with three form versions and no attendees. Staging at `22ccb0fe` reproduced the detail-query error and redirect. The preserving repair added one definition, one binding to version 3 and definition references on the three existing forms in each environment. Exact before/after comparisons confirmed that the course and original form contents were preserved. The current form contains 12 fields. A repeated apply returned `already-compatible` without writes in both environments.

Staging's course and attendance pages passed authenticated browser checks in Slovak and English after two course-specific fetch-cache entries were moved to a private backup and the staging client restarted. Production's existing GraphQL course/form query and the new shared metadata were verified; an authenticated production browser check was not performed. Production services were not restarted or upgraded. The repaired production collections are available for subsequent staging snapshots.

The core build and 77 tests passed, with three opt-in integration tests skipped in that run. The new migration test then passed separately against the dedicated staging fixture database, including rollback and idempotence. The other two integration suites were not rerun for this script-only repair. Documentation reminders, local links and whitespace checks passed. No notifications were sent by the repair. Mode-0600 backups for both environments are retained outside the containers at the location in the private deployment notes.
