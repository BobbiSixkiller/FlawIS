import { GraphQLError } from "graphql";

export function reviewError(
  code: string,
  message: string,
  fieldErrors?: Record<string, string>,
): never {
  throw new GraphQLError(message, { extensions: { code, fieldErrors } });
}

export type WorkflowState = {
  enabled: boolean;
  activeParticipant: boolean;
  closed: boolean;
  configured: boolean;
  hasOriginal: boolean;
  hasAnonymous: boolean;
  approved: boolean;
  frozen: boolean;
  started: boolean;
  assigned: number;
  required: number;
  incomplete: boolean;
  correctionOpen: boolean;
};

/** The detail screen and mutation boundary use the same prerequisite rules. */
export function reviewBlockers(
  s: WorkflowState,
): Record<string, string | null> {
  const common = !s.enabled
    ? "REVIEWS_DISABLED"
    : s.closed
      ? "PAPER_CLOSED"
      : !s.activeParticipant
        ? "INACTIVE_PARTICIPANT"
        : null;
  const ready = !s.hasAnonymous
    ? "ANONYMOUS_REQUIRED"
    : !s.approved
      ? "APPROVAL_REQUIRED"
      : null;
  return {
    ORIGINAL: common,
    ADOPT: common,
    ANONYMOUS:
      common ||
      (!s.hasOriginal ? "ORIGINAL_REQUIRED" : s.frozen ? "ROUND_FROZEN" : null),
    PREPARE:
      common ||
      (!s.hasAnonymous
        ? "ANONYMOUS_REQUIRED"
        : s.frozen
          ? "ROUND_FROZEN"
          : null),
    ASSIGN:
      common ||
      (!s.configured
        ? "QUESTIONNAIRE_REQUIRED"
        : s.assigned >= s.required
          ? "SLOTS_FULL"
          : null),
    SEND: common || (!s.started ? ready : null),
    REMIND: common || (!s.started ? ready : null),
    PREPARE_LINK: common || (!s.started ? ready : null),
    NEXT_ROUND:
      common ||
      (!s.configured
        ? "QUESTIONNAIRE_REQUIRED"
        : s.incomplete
          ? "ROUND_INCOMPLETE"
          : null),
    REQUEST_REVISION: common || (s.correctionOpen ? "REVISION_OPEN" : null),
    ACCEPTED:
      (!s.enabled ? "REVIEWS_DISABLED" : null) ||
      (s.assigned < s.required || s.incomplete || s.correctionOpen
        ? "ACCEPTANCE_BLOCKED"
        : null),
    DECIDE: !s.enabled ? "REVIEWS_DISABLED" : null,
  };
}

export const blockerMessages: Record<string, string> = {
  REVIEWS_DISABLED: "Enable reviews for this conference first.",
  PAPER_CLOSED: "This submission is closed.",
  INACTIVE_PARTICIPANT:
    "Only submissions of active participants can be reviewed.",
  ORIGINAL_REQUIRED: "Upload the original manuscript first.",
  ANONYMOUS_REQUIRED: "Upload the original and anonymized manuscript first.",
  APPROVAL_REQUIRED:
    "Approve the current manuscript and anonymized copy before sending.",
  ROUND_FROZEN: "A sent round is frozen. Upload a new revision for changes.",
  QUESTIONNAIRE_REQUIRED: "Configure the questionnaire first.",
  SLOTS_FULL:
    "All reviewer slots are occupied. Cancel an assignment before replacing it.",
  ROUND_INCOMPLETE: "Complete or cancel the current round first.",
  REVISION_OPEN: "A correction request is already open.",
  ACCEPTANCE_BLOCKED:
    "Complete the required reports and verify outstanding corrections first.",
};
