import type {
  FormFragment,
  ReviewerFragment,
} from "@/lib/graphql/generated/graphql";
export type ReviewerRecord = ReviewerFragment;
export type ReviewContext = {
  isAdmin: boolean;
  scopes: {
    id: string;
    conference: string;
    conferenceSlug?: string;
    conferenceName?: { sk: string; en: string };
    user: string;
    section: string | null;
  }[];
};
export type ReviewCase = {
  id: string;
  revision: number;
  decision: string;
  decisionReason?: string;
  formalApproved: boolean;
  formalNotes: string;
  currentVersion?: string;
  currentRound?: string;
  roundNumber: number;
};
export type Assignment = {
  attachments?: { id: string; filename: string; size: number }[];
  id: string;
  round: string;
  reviewer: string;
  slot: number;
  name: string;
  email: string;
  deadline: string;
  status: string;
  active: boolean;
  recommendation?: string;
  submittedAt?: string;
  conflictReason: string;
  answer?: Answer | null;
  delivery?: string;
};
export type Answer = {
  id: string;
  form: string;
  formVersion: number;
  revision: number;
  submitted: boolean;
  answers: Record<string, string | string[]>;
};
export type QueueFilters = {
  search?: string;
  stage?: string;
  reviewer?: string;
  delivery?: string;
  section?: string;
};
export type ReviewerPage = {
  rows: ReviewerRecord[];
  totalCount: number;
  hasNextPage: boolean;
  endCursor: string | null;
};
export type Eligibility = { blocked: string | null; warnings: string[] };
export type QueueRow = {
  stage?: string;
  submissionId: string;
  title: string;
  titleSk: string;
  sectionId: string;
  authors: { id: string; name: string }[];
  hasFile: boolean;
  requiredReviews: number;
  correctionStatus?: string;
  review: ReviewCase | null;
  assignments: Assignment[];
  ownPaper: boolean;
};
export type Queue = {
  totalCount: number;
  rows: QueueRow[];
  hasNextPage: boolean;
  endCursor: string | null;
};
export type Version = {
  id: string;
  number: number;
  file: string;
  anonymousFile?: string;
  anonymousApproved: boolean;
  createdAt: string;
};
export type Round = {
  id: string;
  number: number;
  requiredReviews: number;
  form: string;
  questionnaire: FormFragment;
  anonymousFile?: string;
  startedAt?: string;
  assignments: Assignment[];
};
export type Correction = {
  id: string;
  instructions: string;
  deadline: string;
  status: string;
  note: string;
  receivedVersion?: string;
};
export type Detail = {
  blockers: Record<string, string | null>;
  conferenceId: string;
  sectionId: string;
  titleSk: string;
  requirements: string;
  submissionId: string;
  title: string;
  authors: { id: string; name: string; email: string; organization?: string }[];
  review: ReviewCase | null;
  versions: Version[];
  rounds: Round[];
  revisions: Correction[];
};
export type Portal = {
  authorFields: string[];
  attachments?: { id: string; filename: string; size: number }[];
  assignmentId: string;
  status: string;
  deadline: string;
  manuscriptFileId: string | null;
  form: FormFragment;
  answer: Answer | null;
};
export type RevisionPortal = {
  id: string;
  instructions: string;
  deadline: string;
  status: string;
  note: string;
};
export function stage(row: QueueRow): string {
  if (row.stage) return row.stage;
  if (row.review?.decision && row.review.decision !== "PENDING")
    return row.review.decision;
  if (row.correctionStatus) return row.correctionStatus;
  if (!row.hasFile) return "MISSING_FILE";
  if (
    row.assignments.length >= row.requiredReviews &&
    row.assignments.every((a) => a.status === "SUBMITTED")
  )
    return "REVIEWS_COMPLETE";
  if (
    row.assignments.some((a) =>
      ["INVITED", "STARTED", "SUBMITTED"].includes(a.status),
    )
  )
    return "IN_REVIEW";
  return row.review?.formalApproved ? "READY" : "PREPARATION";
}
export const statusLabels: Record<string, [string, string]> = {
  OWN_PAPER: ["Vlastný príspevok", "Your submission"],
  NOT_SENT: ["Neodoslané", "Not sent"],
  PENDING: ["Čaká na rozhodnutie", "Awaiting decision"],
  PREPARATION: ["Formálna kontrola", "Preparation"],
  READY: ["Pripravené", "Ready to send"],
  MISSING_FILE: ["Chýba rukopis", "Missing manuscript"],
  IN_REVIEW: ["V recenzovaní", "In review"],
  REVIEWS_COMPLETE: ["Posudky doručené", "Reports received"],
  ACCEPTED: ["Prijaté", "Accepted"],
  REJECTED: ["Zamietnuté", "Rejected"],
  WITHDRAWN: ["Stiahnuté", "Withdrawn"],
  ASSIGNED: ["Priradený", "Assigned"],
  INVITED: ["Pozvaný", "Invited"],
  STARTED: ["Rozpracované", "Draft"],
  SUBMITTED: ["Odovzdané", "Submitted"],
  DECLINED: ["Odmietnuté", "Declined"],
  CANCELLED: ["Zrušené", "Cancelled"],
  PUBLISH: ["Publikovať", "Publish"],
  CONDITIONAL: ["Podmienečne", "Conditional"],
  REJECT: ["Nepublikovať", "Do not publish"],
  QUEUED: ["V rade na odoslanie", "Queued"],
  SENDING: ["Odosiela sa", "Sending"],
  SENT: ["Odoslané", "Sent"],
  FAILED: ["Odoslanie zlyhalo", "Send failed"],
  UNKNOWN: ["Overiť odoslanie", "Verify delivery"],
  REQUESTED: ["Oprava vyžiadaná", "Revision requested"],
  RECEIVED: ["Oprava doručená", "Revision received"],
  VERIFIED: ["Oprava overená", "Revision verified"],
};
export const label = (value: string, lng: string) =>
  statusLabels[value]?.[lng === "en" ? 1 : 0] || value;

export type AuthorWorkspace = {
  decision: string;
  reason: string;
  revisions: Correction[];
};
export type ReviewerProfile = {
  history: {
    id: string;
    submission: string;
    title: string;
    conference: string;
    status: string;
    active: boolean;
    deadline: string;
  }[];
  hasNextPage: boolean;
  endCursor: string | null;
  eligibility: {
    participatedSections: string[];
    guarantorSections: string[];
    conflicts: string[];
  };
};
