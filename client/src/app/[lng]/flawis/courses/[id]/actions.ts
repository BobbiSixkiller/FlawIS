"use server";

import {
  CourseDocument,
  CourseQueryVariables,
} from "@/lib/graphql/generated/graphql";
import { executeGqlFetch } from "@/utils/actions";

export async function getCourse(vars: CourseQueryVariables) {
  const res = await executeGqlFetch(CourseDocument, vars);
  if (res.errors) {
    console.log(res.errors[0].message);
  }

  return res.data?.course;
}
