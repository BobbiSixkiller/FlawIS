"use server";

import {
  CoursesDocument,
  CoursesQueryVariables,
  CreateCourseDocument,
  CreateCourseMutationVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch, executeGqlMutation } from "@/utils/actions";

export async function getCourses(args: CoursesQueryVariables) {
  const res = await executeGqlFetch(CoursesDocument, args, null, {
    tags: ["courses"],
  });
  if (res.errors) {
    console.log(res.errors[0]);
  }

  return res.data.courses;
}

export async function createCourse(vars: CreateCourseMutationVariables) {
  return await executeGqlMutation(
    CreateCourseDocument,
    vars,
    (data) => ({
      message: data.createCourse.message,
      data: data.createCourse.data,
    }),
    { revalidateTags: () => ["courses"] }
  );
}
