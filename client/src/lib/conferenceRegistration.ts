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
