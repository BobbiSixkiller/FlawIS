"use server";

import {
  CourseDocument,
  CourseQueryVariables,
  CourseReachConfigDocument,
  CourseReachConfigQueryVariables,
  CreateCourseAttendeeDocument,
  CreateCourseAttendeeMutationVariables,
  CreateCourseSessionDocument,
  CreateCourseSessionMutationVariables,
  DeleteCourseAttendeeDocument,
  DeleteCourseAttendeeMutationVariables,
  DeleteCourseDocument,
  DeleteCourseMutationVariables,
  DeleteCourseSessionDocument,
  DeleteCourseSessionMutationVariables,
  UpdateCourseAttendeeDocument,
  UpdateCourseAttendeeMutationVariables,
  UpdateCourseDocument,
  UpdateCourseMutationVariables,
  UpdateCourseSessionDocument,
  UpdateCourseSessionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/lib/graphql/actions";
import {
  courseAttendeeMutationTags,
  courseCacheConfig,
  courseCacheTags,
  courseEntityMutationTags,
} from "@/lib/courseCache";

export async function getCourse(vars: CourseQueryVariables) {
  const res = await executeGqlFetch(
    CourseDocument,
    vars,
    undefined,
    courseCacheConfig(
      courseCacheTags.allDetails,
      courseCacheTags.detail(vars.id),
    ),
  );
  if (res.errors) {
    console.log(res.errors[0].message);
  }

  return res.data?.course;
}

export async function getCourseReachConfig(
  vars: CourseReachConfigQueryVariables,
) {
  const res = await executeGqlFetch(
    CourseReachConfigDocument,
    vars,
    undefined,
    courseCacheConfig(courseCacheTags.reachConfig(vars.courseId)),
  );
  if (res.errors) {
    console.log(res.errors[0].message);
  }
  return res.data?.courseReachConfig ?? null;
}

export async function updateCouse(vars: UpdateCourseMutationVariables) {
  return await executeGqlMutation(
    UpdateCourseDocument,
    vars,
    (data) => ({
      message: data.updateCourse.message,
      data: data.updateCourse.data,
    }),
    {
      revalidateTags: (data) =>
        courseEntityMutationTags(data.updateCourse.data.id),
    },
  );
}

export async function deleteCourse(vars: DeleteCourseMutationVariables) {
  return await executeGqlMutation(
    DeleteCourseDocument,
    vars,
    (data) => ({
      message: data.deleteCourse.message,
      data: data.deleteCourse.data,
    }),
    {
      revalidateTags: (data) =>
        courseEntityMutationTags(data.deleteCourse.data.id),
    },
  );
}

export async function createCourseSession(
  vars: CreateCourseSessionMutationVariables,
) {
  return await executeGqlMutation(
    CreateCourseSessionDocument,
    vars,
    (data) => ({
      message: data.createCourseSession.message,
      data: data.createCourseSession.data,
    }),
    {
      revalidateTags: (data) => [
        courseCacheTags.attendance(data.createCourseSession.data.course),
      ],
    },
  );
}

export async function updateCourseSession(
  vars: UpdateCourseSessionMutationVariables,
) {
  return await executeGqlMutation(
    UpdateCourseSessionDocument,
    vars,
    (data) => ({
      message: data.updateCourseSession.message,
      data: data.updateCourseSession.data,
    }),
    {
      revalidateTags: (data) => [
        courseCacheTags.attendance(data.updateCourseSession.data.course),
      ],
    },
  );
}

export async function deleteCourseSession(
  vars: DeleteCourseSessionMutationVariables,
) {
  return await executeGqlMutation(
    DeleteCourseSessionDocument,
    vars,
    (data) => ({
      message: data.deleteCourseSession.message,
      data: data.deleteCourseSession.data,
    }),
    {
      revalidateTags: (data) => [
        courseCacheTags.attendance(data.deleteCourseSession.data.course),
      ],
    },
  );
}

export async function createCourseAttendee(
  vars: CreateCourseAttendeeMutationVariables,
) {
  return await executeGqlMutation(
    CreateCourseAttendeeDocument,
    vars,
    (data) => ({
      message: data.createCourseAttendee.message,
      data: data.createCourseAttendee.data,
    }),
    {
      revalidateTags: (data) =>
        courseAttendeeMutationTags(data.createCourseAttendee.data.course),
    },
  );
}

export async function updateCourseAttendee(
  vars: UpdateCourseAttendeeMutationVariables,
) {
  return await executeGqlMutation(
    UpdateCourseAttendeeDocument,
    vars,
    (data) => ({
      message: data.updateCourseAttendee.message,
      data: data.updateCourseAttendee.data,
    }),
    {
      revalidateTags: (data) =>
        courseAttendeeMutationTags(data.updateCourseAttendee.data.course),
    },
  );
}

export async function deleteCourseAttendee(
  vars: DeleteCourseAttendeeMutationVariables,
) {
  return await executeGqlMutation(
    DeleteCourseAttendeeDocument,
    vars,
    (data) => ({
      message: data.deleteCourseAttendee.message,
      data: data.deleteCourseAttendee.data,
    }),
    {
      revalidateTags: (data) =>
        courseAttendeeMutationTags(data.deleteCourseAttendee.data.course),
    },
  );
}
