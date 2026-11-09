"use server";
import { executeGqlFetch } from "@/lib/graphql/actions";
import {
  ReviewerDirectoryDocument,
  AssignmentEligibilityDocument,
  AuthorReviewWorkspaceDocument,
  ReviewerProfileDocument,
  SetReviewerEligibilityDocument,
  TypedDocumentString,
  ReviewAdminContextDocument,
  ReviewersDocument,
  SaveReviewerDocument,
  ConferenceReviewSettingsDocument,
  ConfigureConferenceReviewsDocument,
  ConferenceReviewQueueDocument,
  SubmissionReviewDocument,
  ConferenceReviewActionDocument,
  ReviewCoordinatorsDocument,
  SetReviewCoordinatorDocument,
  RevokeReviewCoordinatorDocument,
  FormLibraryDocument,
  FormVersionsDocument,
  CreateLibraryFormDocument,
  PublishLibraryFormDocument,
  ArchiveLibraryFormDocument,
  ConferenceActivityDocument,
  ReviewerPortalDocument,
  SaveReviewReportDocument,
  DeclineReviewDocument,
  RevisionPortalDocument,
  AuthorReviewFeedbackDocument,
  BindCourseRegistrationFormDocument,
  FormFieldInput,
} from "@/lib/graphql/generated/graphql";
import type {
  QueueFilters,
  ReviewerPage,
  Eligibility,
  AuthorWorkspace,
  ReviewerProfile,
  Detail,
  Portal,
  Queue,
  ReviewContext,
  RevisionPortal,
} from "./types";
async function run<T, V>(
  document: TypedDocumentString<T, V>,
  variables: V,
): Promise<T> {
  const response = await executeGqlFetch(
    document,
    variables,
    null,
    undefined,
    "no-store",
  );
  if (response.errors?.length) {
    const error = response.errors[0];
    throw Object.assign(new Error(error.message), {
      code: error.extensions?.code,
      fields: error.extensions?.fieldErrors,
    });
  }
  return response.data;
}
export async function getReviewContext() {
  return (await run(ReviewAdminContextDocument, {}))
    .reviewAdminContext as unknown as ReviewContext;
}
export async function getReviewers(search = "", after?: string) {
  return (await run(ReviewersDocument, { search, after })).reviewers;
}
export async function saveReviewer(data: Record<string, unknown>, id?: string) {
  return (await run(SaveReviewerDocument, { data, id })).saveReviewer;
}
export async function getReviewSettings(conference: string) {
  return (await run(ConferenceReviewSettingsDocument, { conference }))
    .conferenceReviewSettings;
}
export async function configureReviews(
  conference: string,
  data: Record<string, unknown>,
) {
  return (await run(ConfigureConferenceReviewsDocument, { conference, data }))
    .configureConferenceReviews;
}
export async function getReviewQueue(
  conference: string,
  section?: string,
  after?: string,
  filters: QueueFilters = {},
) {
  return (
    await run(ConferenceReviewQueueDocument, {
      ...filters,
      conference,
      section,
      after,
      first: 30,
    })
  ).conferenceReviewQueue as unknown as Queue;
}
export async function getReviewDetail(submission: string) {
  return (await run(SubmissionReviewDocument, { submission }))
    .submissionReview as unknown as Detail;
}
export async function reviewAction(
  submission: string,
  action: string,
  data: Record<string, unknown>,
) {
  return (
    await run(ConferenceReviewActionDocument, { submission, action, data })
  ).conferenceReviewAction;
}
export async function getCoordinators(conference: string) {
  return (await run(ReviewCoordinatorsDocument, { conference }))
    .reviewCoordinators;
}
export async function setCoordinator(
  conference: string,
  email: string,
  section?: string,
) {
  return (
    await run(SetReviewCoordinatorDocument, { conference, email, section })
  ).setReviewCoordinator;
}
export async function revokeCoordinator(id: string) {
  return (await run(RevokeReviewCoordinatorDocument, { id }))
    .revokeReviewCoordinator;
}
export async function getFormLibrary() {
  return (await run(FormLibraryDocument, {})).formLibrary;
}
export async function getFormVersions(definition: string) {
  return (await run(FormVersionsDocument, { definition })).formVersions;
}
export async function createLibraryForm(name: string, description = "") {
  return (await run(CreateLibraryFormDocument, { name, description }))
    .createLibraryForm;
}
export async function publishForm(
  definition: string,
  fields: FormFieldInput[],
  name?: string,
  description?: string,
) {
  return (
    await run(PublishLibraryFormDocument, {
      definition,
      fields,
      name,
      description,
    })
  ).publishLibraryForm;
}
export async function archiveForm(definition: string) {
  return (await run(ArchiveLibraryFormDocument, { definition }))
    .archiveLibraryForm;
}
export async function bindCourseForm(course: string, form: string) {
  return (await run(BindCourseRegistrationFormDocument, { course, form }))
    .bindCourseRegistrationForm;
}
export async function getActivity(
  conference: string,
  submission?: string,
  before?: string,
) {
  return (
    await run(ConferenceActivityDocument, { conference, submission, before })
  ).conferenceActivity;
}
export async function getReviewerPortal(token: string) {
  return (await run(ReviewerPortalDocument, { token }))
    .reviewerPortal as unknown as Portal;
}
export async function saveReport(
  token: string,
  answers: Record<string, unknown>,
  submit: boolean,
  expectedRevision?: number,
) {
  return (
    await run(SaveReviewReportDocument, {
      token,
      answers,
      submit,
      expectedRevision,
    })
  ).saveReviewReport;
}
export async function declineReport(token: string) {
  return (await run(DeclineReviewDocument, { token })).declineReview;
}
export async function getRevisionPortal(token: string) {
  return (await run(RevisionPortalDocument, { token }))
    .revisionPortal as unknown as RevisionPortal;
}
export async function getAuthorFeedback(submission: string) {
  return (await run(AuthorReviewFeedbackDocument, { submission }))
    .authorReviewFeedback;
}
export async function enterReport(
  assignment: string,
  answers: Record<string, unknown>,
  expectedRevision?: number,
) {
  const { EnterReviewReportDocument } =
    await import("@/lib/graphql/generated/graphql");
  return (
    await run(EnterReviewReportDocument, {
      assignment,
      answers,
      expectedRevision,
    })
  ).enterReviewReport;
}

export async function getAuthorWorkspace(submission: string) {
  return (await run(AuthorReviewWorkspaceDocument, { submission }))
    .authorReviewWorkspace as unknown as AuthorWorkspace;
}
export async function getReviewerProfile(
  reviewer: string,
  conference?: string,
  before?: string,
) {
  return (await run(ReviewerProfileDocument, { reviewer, conference, before }))
    .reviewerProfile as unknown as ReviewerProfile;
}
export async function saveEligibility(
  conference: string,
  reviewer: string,
  data: Record<string, unknown>,
) {
  return (
    await run(SetReviewerEligibilityDocument, { conference, reviewer, data })
  ).setReviewerEligibility;
}

export async function getReviewerDirectory(
  search = "",
  after?: string,
  archived?: boolean,
): Promise<ReviewerPage> {
  return (await run(ReviewerDirectoryDocument, { search, after, archived }))
    .reviewerDirectory as unknown as ReviewerPage;
}
export async function getAssignmentEligibility(
  submission: string,
  reviewer: string,
): Promise<Eligibility> {
  return (await run(AssignmentEligibilityDocument, { submission, reviewer }))
    .assignmentEligibility as unknown as Eligibility;
}

/** Return expected errors as data: Next.js redacts thrown server-action errors in production. */
export async function reviewMutation(
  operation: string,
  args: Record<string, unknown>,
) {
  try {
    let value: unknown;
    switch (operation) {
      case "review":
        value = await reviewAction(
          String(args.submission),
          String(args.action),
          args.data as Record<string, unknown>,
        );
        break;
      case "reviewer":
        value = await saveReviewer(
          args.data as Record<string, unknown>,
          args.id as string | undefined,
        );
        break;
      case "settings":
        value = await configureReviews(
          String(args.conference),
          args.data as Record<string, unknown>,
        );
        break;
      case "eligibility":
        value = await saveEligibility(
          String(args.conference),
          String(args.reviewer),
          args.data as Record<string, unknown>,
        );
        break;
      case "grant":
        value = await setCoordinator(
          String(args.conference),
          String(args.email),
          args.section as string | undefined,
        );
        break;
      case "revoke":
        value = await revokeCoordinator(String(args.id));
        break;
      case "createForm":
        value = await createLibraryForm(
          String(args.name),
          String(args.description || ""),
        );
        break;
      case "publishForm":
        value = await publishForm(
          String(args.definition),
          args.fields as FormFieldInput[],
          args.name as string,
          args.description as string,
        );
        break;
      case "archiveForm":
        value = await archiveForm(String(args.definition));
        break;
      case "bindForm":
        value = await bindCourseForm(String(args.course), String(args.form));
        break;
      case "report":
        value = await saveReport(
          String(args.token),
          args.answers as Record<string, unknown>,
          Boolean(args.submit),
          args.expectedRevision as number | undefined,
        );
        break;
      case "decline":
        value = await declineReport(String(args.token));
        break;
      case "enterReport":
        value = await enterReport(
          String(args.assignment),
          args.answers as Record<string, unknown>,
          args.expectedRevision as number | undefined,
        );
        break;
      default:
        throw new Error("Unknown operation.");
    }
    return { ok: true as const, value };
  } catch (error) {
    const e = error as Error & {
      code?: string;
      fields?: Record<string, string>;
    };
    return {
      ok: false as const,
      error: {
        message: e.message || "Request failed.",
        code: e.code || "REQUEST_FAILED",
        fields: e.fields,
      },
    };
  }
}
export async function getPrivatePortal(
  token: string,
  kind: "review" | "revision",
) {
  try {
    const value =
      kind === "review"
        ? await getReviewerPortal(token)
        : await getRevisionPortal(token);
    return { ok: true as const, value };
  } catch (error) {
    return {
      ok: false as const,
      invalid: ["INVALID_REVIEW_LINK", "INVALID_REVISION_LINK"].includes(
        (error as { code?: string }).code || "",
      ),
    };
  }
}
