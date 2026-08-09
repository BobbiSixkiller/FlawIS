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

type ConferenceDates = {
  end: string | Date;
  regEnd?: string | Date | null;
  start: string | Date;
  submissionDeadline?: string | Date | null;
};

export function conferenceWorkspaceState(
  dates: ConferenceDates,
  ticketAllowsSubmissions: boolean,
  now: number,
) {
  const start = new Date(dates.start).getTime();
  const end = new Date(dates.end).getTime();
  const registrationEnd = dates.regEnd
    ? new Date(dates.regEnd).getTime()
    : undefined;
  const submissionDeadline = dates.submissionDeadline
    ? new Date(dates.submissionDeadline).getTime()
    : undefined;

  return {
    eventState: now < start ? "upcoming" : now <= end ? "ongoing" : "ended",
    registrationOpen: registrationEnd === undefined || now <= registrationEnd,
    submissionsEditable:
      ticketAllowsSubmissions &&
      (submissionDeadline === undefined || now <= submissionDeadline),
  } as const;
}
