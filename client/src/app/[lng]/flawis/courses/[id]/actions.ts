"use server";

import {
  CourseDocument,
  CourseQueryVariables,
  DeleteCourseDocument,
  DeleteCourseMutationVariables,
  UpdateCourseDocument,
  UpdateCourseMutationVariables,
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
