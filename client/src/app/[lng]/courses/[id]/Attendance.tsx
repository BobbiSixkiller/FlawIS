import { Status } from "@/lib/graphql/generated/graphql";
import { getCourseAttendance } from "../../flawis/courses/[id]/attendance/actions";
import { AttendanceTable } from "../../flawis/courses/[id]/attendance/AttendanceTable";

export default async function Attendance({ id }: { id: string }) {
  const attendance = await getCourseAttendance({ id, sort: [] });

  return attendance.edges[0]?.node.attendee.status === Status.Accepted ? (
    <AttendanceTable initialData={attendance} vars={{ id, sort: [] }} />
  ) : null;
}
