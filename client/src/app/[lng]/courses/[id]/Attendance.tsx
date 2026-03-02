import { FormFragment, Status } from "@/lib/graphql/generated/graphql";
import { getCourseAttendance } from "../../flawis/courses/[id]/attendance/actions";
import { AttendanceTable } from "../../flawis/courses/[id]/attendance/AttendanceTable";

export default async function Attendance({
  id,
  registrationForm,
}: {
  id: string;
  registrationForm: FormFragment;
}) {
  const attendance = await getCourseAttendance({ id, sort: [] });

  return attendance.edges[0]?.node.attendee.status === Status.Accepted ? (
    <div className="text-sm">
      <AttendanceTable
        registrationForm={registrationForm}
        initialData={attendance}
        vars={{ id, sort: [] }}
      />
      * pre zmenu formy účasti stlačte switch
    </div>
  ) : null;
}
