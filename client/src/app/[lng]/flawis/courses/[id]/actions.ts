"use server";

import {
  CourseDocument,
  CourseQueryVariables,
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
  UpdateCourseAttendeeFilesDocument,
  UpdateCourseAttendeeFilesMutationVariables,
  UpdateCourseDocument,
  UpdateCourseMutationVariables,
  UpdateCourseSessionDocument,
  UpdateCourseSessionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getCourse(vars: CourseQueryVariables) {
  const res = await executeGqlFetch(CourseDocument, vars, undefined, {
    tags: [`courses:${vars.id}`],
  });
  if (res.errors) {
    console.log(res.errors[0].message);
  }

  return res.data?.course;
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
      revalidateTags: (data) => [
        `courses:${data.updateCourse.data.id}`,
        "courses",
      ],
    }
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
      revalidateTags: (data) => [
        `courses:${data.deleteCourse.data.id}`,
        "courses",
      ],
    }
  );
}

export async function createCourseSession(
  vars: CreateCourseSessionMutationVariables
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
        `courses:${data.createCourseSession.data.course}`,
      ],
    }
  );
}

export async function updateCourseSession(
  vars: UpdateCourseSessionMutationVariables
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
        `courses:${data.updateCourseSession.data.course}`,
      ],
    }
  );
}

export async function deleteCourseSession(
  vars: DeleteCourseSessionMutationVariables
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
        `courses:${data.deleteCourseSession.data.course}`,
      ],
    }
  );
}

export async function createCourseAttendee(
  vars: CreateCourseAttendeeMutationVariables
) {
  return await executeGqlMutation(
    CreateCourseAttendeeDocument,
    vars,
    (data) => ({
      message: data.createCourseAttendee.message,
      data: data.createCourseAttendee.data,
    }),
    {
      revalidateTags: (data) => [
        `courses:${data.createCourseAttendee.data.course}`,
      ],
    }
  );
}

export async function updateCourseAttendeeFiles(
  vars: UpdateCourseAttendeeFilesMutationVariables
) {
  return await executeGqlMutation(
    UpdateCourseAttendeeFilesDocument,
    vars,
    (data) => ({
      message: data.updateCourseAttendeeFiles.message,
      data: data.updateCourseAttendeeFiles.data,
    }),
    {
      revalidateTags: (data) => [
        `courses:${data.updateCourseAttendeeFiles.data.course}`,
      ],
    }
  );
}

export async function deleteCourseAttendee(
  vars: DeleteCourseAttendeeMutationVariables
) {
  return await executeGqlMutation(
    DeleteCourseAttendeeDocument,
    vars,
    (data) => ({
      message: data.deleteCourseAttendee.message,
      data: data.deleteCourseAttendee.data,
    }),
    {
      revalidateTags: (data) => [
        `courses:${data.deleteCourseAttendee.data.course}`,
      ],
    }
  );
}
