"use server";

import {
  AttendanceDocument,
  AttendanceQueryVariables,
  ChangeCourseAttendeeStatusDocument,
  ChangeCourseAttendeeStatusMutationVariables,
  UpdateAttendanceHoursDocument,
  UpdateAttendanceHoursMutationVariables,
  UpdateAttendanceOnlineDocument,
  UpdateAttendanceOnlineMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getCourseAttendance(vars: AttendanceQueryVariables) {
  const res = await executeGqlFetch(AttendanceDocument, vars);

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.course.attendance;
}

export async function changeCourseAttendeeStatus(
  vars: ChangeCourseAttendeeStatusMutationVariables
) {
  return await executeGqlMutation(
    ChangeCourseAttendeeStatusDocument,
    vars,
    (data) => ({
      message: data.changeCourseAttendeeStatus.message,
      data: data.changeCourseAttendeeStatus.data,
    }),
    {
      revalidatePaths: (data) => [
        `/courses/${data.changeCourseAttendeeStatus.data.course}/attendance`,
      ],
    }
  );
}

export async function setAttendedHours(
  vars: UpdateAttendanceHoursMutationVariables
) {
  return await executeGqlMutation(
    UpdateAttendanceHoursDocument,
    vars,
    (data) => ({
      message: data.updateAttendanceHours.message,
      data: data.updateAttendanceHours.data,
    }),
    {
      revalidatePaths: (data) => [
        `/courses/${data.updateAttendanceHours.data.session.course}/attendance`,
      ],
    }
  );
}

export async function setOnlineAttendance(
  vars: UpdateAttendanceOnlineMutationVariables
) {
  return await executeGqlMutation(
    UpdateAttendanceOnlineDocument,
    vars,
    (data) => ({
      message: data.updateAttendanceOnline.message,
      data: data.updateAttendanceOnline.data,
    }),
    {
      revalidatePaths: (data) => [
        `/courses/${data.updateAttendanceOnline.data.session.course}/attendance`,
      ],
    }
  );
}
