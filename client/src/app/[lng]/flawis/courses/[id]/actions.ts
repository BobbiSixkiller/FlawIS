"use server";

import {
  CourseDocument,
  CourseQueryVariables,
  CreateCourseSessionDocument,
  CreateCourseSessionMutationVariables,
  DeleteCourseDocument,
  DeleteCourseMutationVariables,
  UpdateCourseDocument,
  UpdateCourseMutationVariables,
  UpdateCourseSessionDocument,
  UpdateCourseSessionMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";
import CourseForm from "../CourseForm";

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

export async function deleteCourseSession(params: type) {}
