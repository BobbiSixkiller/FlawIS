# Review workflow comparison with the shared chat

Audit date: 2026-11-11. Implementation baseline: `22ccb0fe`.

The [shared conversation](https://chatgpt.com/share/6af1b1c6-1744-83eb-9d9f-d0a52192bbb7) describes several review operations already present in FlawIS, but also a short reviewer correction check and final-document assembly that are absent from this baseline. Statements in that conversation that a feature was completed or tested are not evidence that it exists in this repository.

This is a dated comparison, not an approved implementation plan. See [conference reviews](conference-reviews.md) for the supported workflow.

## Coverage

| Conversation item | Baseline implementation | Assessment |
| --- | --- | --- |
| Download an anonymous review package; copy a private link; enter an externally received report | Package download, copy-link action and manual report entry with an optional original report attachment exist. | Supported. |
| Prepare an email with attachments, then confirm external sending | FlawIS queues its own invitation email with the anonymous manuscript and a questionnaire link. There is no Outlook handoff or manual sent-confirmation action. | Different sending workflow. |
| Show numbered sending steps and move automatically to the second reviewer | Reviewer slots are numbered. The suggested action targets the next uninvited reviewer after refresh, but the send dialog closes; another click is required. | Partial; no numbered sending wizard or automatic dialog transition. |
| Avoid confusing sent mail with review completion | Assignment/report status and email delivery are separate badges; sending reports that email was queued. | Separation exists; the original screenshot complaint was not reproduced. |
| Reviewer checks corrections with a brief result and note, preserving the original report | Authors upload corrections; a coordinator verifies them. Another full review round is available. | The separate brief reviewer check is missing. |
| Receive revised manuscripts and English versions | Version history exists, with one current manuscript and its anonymous copy. There are no independent language tracks or completeness rules for multiple variants. | Versioning supported; meaning of the conversation's two required versions is unresolved. |
| Confirm final manuscripts for publication | Editorial acceptance exists, but there is no separate final-publication approval tied to a manuscript version. | Missing. |
| Select and order final articles, then download one editable Word file | Exports generate review-report DOCX files and ZIP packages. | Final-article selection, ordering and DOCX merging are missing. |

## Decisive evidence

### Sending and coordinator controls

The [submission detail](../client/src/app/[lng]/flawis/conferences/[slug]/reviews/[submissionId]/_components/submission-detail.tsx) renders separate assignment and delivery badges, manual report entry, private-link copying and package downloading. Its `nextInvitation` selects an `ASSIGNED` reviewer. After a successful action, [SubmissionActionDialog](../client/src/app/[lng]/flawis/conferences/[slug]/reviews/[submissionId]/_components/submission-actions.tsx) reloads details and [FormDialog](../client/src/components/form/form-dialog.tsx) closes. It does not automatically open the next reviewer's dialog.

The invitation branch in [ReviewService](../core/src/services/reviews/review.service.ts) queues an email with the round's anonymous file and online questionnaire URL. The [mail worker](../mail/src/email/email.service.ts) sends that payload. The blank Word questionnaire is included in a downloaded package by [ReviewExportService](../core/src/services/reviews/export.service.ts), but is not attached to that invitation email. Whether an Outlook route or an additional questionnaire attachment is desirable is a workflow decision, not an established delivery defect.

Anonymous copies are uploaded and explicitly approved. [ReviewFileService](../core/src/services/reviews/file.service.ts) does not automatically anonymize manuscript contents. The conversation also describes manual upload of an externally anonymized file, which this route supports.

### Correction verification

`REQUEST_REVISION` creates an author correction request; uploading the revised DOCX records `RECEIVED`, the author's note and `receivedVersion`. `VERIFY_REVISION` changes that request to `VERIFIED` through the coordinator action API. The note on [RevisionRequest](../core/src/entitites/Review.ts) is the author's upload note, not a reviewer correction verdict.

The [reviewer portal](../client/src/app/[lng]/conferences/review/[token]/_components/reviewer-portal.tsx) presents the pinned review questionnaire. `NEXT_ROUND` creates another full review round, and reopening a report allows editing its questionnaire. Neither provides a separate correction-response record or brief follow-up portal. Original rounds and immutable answer revisions are retained by [ReviewService](../core/src/services/reviews/review.service.ts) and [FormService](../core/src/services/form.service.ts), so history preservation already has support.

The [workflow integration test](../core/test/reviewWorkflow.integration.test.ts) explicitly asserts that uploading a correction sends no new reviewer invitation and that acceptance is blocked until the coordinator verifies the correction. These assertions were inspected, not executed during this audit.

### Final publication and Word assembly

[SubmissionReview and ManuscriptVersion](../core/src/entitites/Review.ts) track the editorial decision, current version, anonymous copy and anonymity approval. They do not identify an approved publication version or independently approved manuscript languages. Translated titles/abstracts and presentation language in [Submission](../core/src/entitites/Submission.ts) do not provide those manuscript tracks.

`DECIDE` requires completed reports and verified outstanding corrections before acceptance. Closing revokes review links, and `ReviewFileService.upload` rejects further non-report uploads while the submission is closed. A final handoff after acceptance therefore needs explicit workflow support. There is no separate confirmation of restored author names, affiliations or acknowledgements for publication.

`ReviewExportService.report` exports a completed review form. `exportMany` collects report exports into a ZIP; it does not merge article documents. The [export routes](../core/src/routes/reviews.ts) expose those reports/packages. No corresponding final-article ordering or merge control exists in the review workspace. Page breaks and preservation of article footnotes, images and tables during merging are consequently unimplemented and untested here.

The conversation's latest request narrows the earlier proceedings proposal to joining final Word files. Full PDF generation, front matter, contents and publication-wide formatting should not be treated as agreed requirements from that exchange alone.

## Scope and validation

The public page was read in a browser: 14 user messages and three assistant messages. Uploaded files and screenshots appeared as placeholders; their contents, any linked prototype and the named authors' actual stored submissions were not verified. The phrase referring to two versions does not establish whether these are language variants, anonymous/original pairs or something else.

The audit inspected review models, service actions, file handling, export routes, mail payloads, coordinator/reviewer/author UI and relevant test assertions, with scoped searches for additional correction, external-send and proceedings implementations. It did not run application suites, exercise live review actions, send mail or deploy changes. Only documentation changed; documentation reminders, local links and whitespace were checked.

If implementation is requested, the suggested order is a dedicated reviewer correction check, explicit final-version approval, then ordered DOCX assembly. The merger depends on identifying approved final versions. Automatic next-reviewer navigation is a separate UI enhancement. The sending workflow and meaning of multiple manuscript variants need a product decision before implementing those particular changes.
