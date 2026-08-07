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
    eventState:
      now < start ? "upcoming" : now <= end ? "ongoing" : "ended",
    registrationOpen:
      registrationEnd === undefined || now <= registrationEnd,
    submissionsEditable:
      ticketAllowsSubmissions &&
      (submissionDeadline === undefined || now <= submissionDeadline),
  } as const;
}
