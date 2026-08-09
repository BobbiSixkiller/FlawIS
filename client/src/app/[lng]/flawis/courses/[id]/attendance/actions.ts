"use server";

import {
  AttendanceDocument,
  AttendanceQueryVariables,
  ChangeCourseAttendeeStatusDocument,
  ChangeCourseAttendeeStatusMutationVariables,
  SyncCourseElearningAccessDocument,
  SyncCourseElearningAccessMutationVariables,
  UpdateAttendanceHoursDocument,
  UpdateAttendanceHoursMutationVariables,
  UpdateAttendanceOnlineDocument,
  UpdateAttendanceOnlineMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/lib/graphql/actions";
import {
  courseAttendeeMutationTags,
  courseCacheConfig,
  courseCacheTags,
} from "@/lib/courseCache";

export async function getCourseAttendance(vars: AttendanceQueryVariables) {
  const res = await executeGqlFetch(
    AttendanceDocument,
    vars,
    null,
    courseCacheConfig(courseCacheTags.attendance(vars.id)),
  );

  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.course.attendance;
}

export async function changeCourseAttendeeStatus(
  vars: ChangeCourseAttendeeStatusMutationVariables,
) {
  return await executeGqlMutation(
    ChangeCourseAttendeeStatusDocument,
    vars,
    (data) => ({
      message: data.changeCourseAttendeeStatus.message,
      data: data.changeCourseAttendeeStatus.data,
    }),
    {
      revalidateTags: (data) =>
        courseAttendeeMutationTags(
          data.changeCourseAttendeeStatus.data.course,
        ),
    },
  );
}

export async function syncCourseElearningAccess(
  vars: SyncCourseElearningAccessMutationVariables,
) {
  return await executeGqlMutation(
    SyncCourseElearningAccessDocument,
    vars,
    (data) => ({
      message: data.syncCourseElearningAccess.message,
      data: data.syncCourseElearningAccess.data,
    }),
    {
      revalidateTags: (data) =>
        courseAttendeeMutationTags(
          data.syncCourseElearningAccess.data.course,
        ),
    },
  );
}

export async function setAttendedHours(
  vars: UpdateAttendanceHoursMutationVariables,
) {
  return await executeGqlMutation(
    UpdateAttendanceHoursDocument,
    vars,
    (data) => ({
      message: data.updateAttendanceHours.message,
      data: data.updateAttendanceHours.data,
    }),
    {
      revalidateTags: (data) => [
        courseCacheTags.attendance(
          data.updateAttendanceHours.data.session.course,
        ),
      ],
    },
  );
}

export async function setOnlineAttendance(
  vars: UpdateAttendanceOnlineMutationVariables,
) {
  return await executeGqlMutation(
    UpdateAttendanceOnlineDocument,
    vars,
    (data) => ({
      message: data.updateAttendanceOnline.message,
      data: data.updateAttendanceOnline.data,
    }),
    {
      revalidateTags: (data) => [
        courseCacheTags.attendance(
          data.updateAttendanceOnline.data.session.course,
        ),
      ],
    },
  );
}
