export function invitedTicketId(
  tickets: ReadonlyArray<{ id: string; withSubmission: boolean }>,
  hasSubmissionInvite: boolean,
) {
  if (!hasSubmissionInvite) return "";
  return tickets.find((ticket) => ticket.withSubmission)?.id ?? "";
}

export function conferenceWorkspaceHref(
  slug: string,
  focusSubmissions = false,
) {
  const workspaceHref = `/${slug}`;
  return focusSubmissions ? `${workspaceHref}#submissions` : workspaceHref;
}

export function conferenceInvitationHref(
  lng: string,
  slug: string,
  submissionId?: string,
  token?: string,
) {
  const query = new URLSearchParams();
  if (submissionId) query.set("submission", submissionId);
  if (token) query.set("token", token);

  const path = `/${lng}/${slug}/register`;
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

type ConferenceDates = {
  end: string | Date;
  regEnd?: string | Date | null;
  start: string | Date;
  submissionDeadline?: string | Date | null;
};

export function isConferenceRegistrationOpen(
  registrationEnd: string | Date | null | undefined,
  now: number,
) {
  return !registrationEnd || now <= new Date(registrationEnd).getTime();
}

export function conferenceWorkspaceState(
  dates: ConferenceDates,
  ticketAllowsSubmissions: boolean,
  now: number,
) {
  const start = new Date(dates.start).getTime();
  const end = new Date(dates.end).getTime();
  const submissionDeadline = dates.submissionDeadline
    ? new Date(dates.submissionDeadline).getTime()
    : undefined;

  return {
    eventState: now < start ? "upcoming" : now <= end ? "ongoing" : "ended",
    registrationOpen: isConferenceRegistrationOpen(dates.regEnd, now),
    submissionsEditable:
      ticketAllowsSubmissions &&
      (submissionDeadline === undefined || now <= submissionDeadline),
  } as const;
}
